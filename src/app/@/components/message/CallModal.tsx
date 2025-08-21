import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, VideoIcon, VideoOff } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useSocket } from '../../../../context/SocketContext';

const callModalStyles = `
  .call-modal-container * {
    box-sizing: border-box !important;
  }
  .call-modal-container button {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  .call-modal-container .call-controls {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  /* Override any navigation bars */
  .call-modal-container {
    z-index: 99999 !important;
  }
  
  /* Hide any elements below modal */
  body > *:not(.call-modal-container) {
    z-index: 1 !important;
  }
  
  /* Force modal to top */
  .call-modal-container .bg-white {
    z-index: 100000 !important;
    position: relative !important;
  }
  
  /* Hide navigation bars and overlays */
  .call-modal-container ~ *,
  .call-modal-container + *,
  [class*="navigation"],
  [class*="nav"],
  [class*="bottom"],
  [class*="overlay"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    z-index: -1 !important;
  }
  
  /* Hide any sticky elements */
  [class*="sticky"],
  [class*="fixed"]:not(.call-modal-container) {
    z-index: 1 !important;
  }
  
  /* Hide specific navigation bar with "Cuộc gọi đến" */
  div:contains("Cuộc gọi đến"),
  div:contains("Incoming call"),
  [class*="bottom"],
  [class*="overlay"],
  [class*="notification"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    z-index: -1 !important;
  }
  
  /* Force hide any element with call text */
  *:contains("Cuộc gọi đến"),
  *:contains("Incoming call") {
    display: none !important;
  }
`;

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: 'voice' | 'video';
  otherUser: {
    name: string;
    avatar: string | null;
  };
  onAccept?: () => void;
  onReject?: () => void;
  onEnd?: () => void;
  isIncoming: boolean;
  targetUserId?: string; // Add target user ID for WebRTC signaling
}

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  callType,
  otherUser,
  onAccept,
  onReject,
  onEnd,
  isIncoming,
  targetUserId
}) => {
  // Socket.IO context for WebRTC signaling
  const socketContext = useSocket();
  const socket = socketContext.socket;
  
  // Early return if modal is not open
  if (!isOpen) {
    return null;
  }

  // Validate required props
  if (!otherUser || !otherUser.name) {
    return null;
  }
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallConnected, setIsCallConnected] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize video when modal opens for video calls
  useEffect(() => {
    if (isOpen && callType === 'video') {
      // Request camera and microphone permissions
      navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      }).then(stream => {
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          
          // Auto-play local video
          localVideoRef.current.play().catch(error => {
            // Local video play error (expected)
          });
        }

        // Initialize WebRTC peer connection
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });

        peerConnectionRef.current = peerConnection;

        // Add local stream tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Handle incoming remote stream
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            
            // Auto-play remote video
            remoteVideoRef.current.play().catch(error => {
              // Remote video play error (expected)
            });
          }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            // Send ICE candidate to remote peer via Socket.IO
            if (socket) {
              socket.emit('ice_candidate', {
                candidate: event.candidate,
                targetUserId: targetUserId || 'unknown'
              });
            }
          }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          // Connection state changed
        };

        // For outgoing calls, create and send offer
        if (!isIncoming) {
          peerConnection.createOffer()
            .then(offer => {
              return peerConnection.setLocalDescription(offer);
            })
            .then(() => {
              // Send offer to remote peer via Socket.IO
              if (socket) {
                socket.emit('call_offer', { 
                  offer: peerConnection.localDescription,
                  // Add target user info for routing
                  targetUserId: targetUserId || 'unknown'
                });
              }
            })
            .catch(error => {
              // Failed to create offer
            });
        }

      }).catch(error => {
        alert('Không thể truy cập camera/microphone. Vui lòng kiểm tra quyền truy cập.');
      });
    }

    // Cleanup when modal closes
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [isOpen, callType, isIncoming, targetUserId]);

  // Call duration timer
  useEffect(() => {
    if (isCallActive) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isCallActive]);

  const handleAcceptCall = useCallback(async () => {
    setIsCallActive(true);
    
    // For incoming calls, we need to handle the offer
    if (isIncoming && callType === 'video' && peerConnectionRef.current) {
      try {
        // Create answer
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        // Send answer to remote peer via Socket.IO
        if (socket) {
          socket.emit('call_answer', { 
            answer: answer,
            // Add target user info for routing
            targetUserId: targetUserId || 'unknown'
          });
        }
        
      } catch (error) {
        // Failed to create answer
      }
    }
    
    onAccept?.();
  }, [onAccept, isCallActive, isIncoming, callType, socket, targetUserId]);

  const handleRejectCall = useCallback(() => {
    onReject?.();
  }, [onReject]);

  const handleEndCall = useCallback(() => {
    setIsCallActive(false);
    
    // Cleanup video streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Cleanup peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    onEnd?.();
  }, [onEnd]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    setIsVideoOff(prev => !prev);
  }, []);

  // Handle incoming offer from remote peer
  const handleIncomingOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current && isIncoming) {
      try {
        // Set remote description
        await peerConnectionRef.current.setRemoteDescription(offer);
        
        // Create answer
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        // TODO: Send answer back to remote peer via Socket.IO
        // socket.emit('call_answer', { answer: answer });
        
      } catch (error) {
        // Failed to handle incoming offer
      }
    }
  }, [isIncoming]);

  // Handle incoming answer from remote peer (for outgoing calls)
  const handleIncomingAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current && !isIncoming) {
      try {
        // Set remote description
        await peerConnectionRef.current.setRemoteDescription(answer);
        
        // Now the call is connected!
        setIsCallConnected(true);
        
        // The remote stream should now come through the peer connection
        // No need for mock stream anymore
        
      } catch (error) {
        // Failed to handle incoming answer
      }
    }
  }, [isIncoming]);

  // Handle incoming ICE candidates
  const handleIncomingIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } catch (error) {
        // Failed to add ICE candidate
      }
    }
  }, []);

  // Socket.IO event listeners for WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    // Listen for SDP answers (for outgoing calls)
    const handleCallAnswer = (data: any) => {
      if (data.answer) {
        handleIncomingAnswer(data.answer);
      }
    };

    // Listen for incoming calls (for incoming calls)
    const handleIncomingCall = (data: any) => {
      if (data.offer) {
        handleIncomingOffer(data.offer);
      }
    };

    // Listen for ICE candidates
    const handleIceCandidate = (data: any) => {
      if (data.candidate) {
        handleIncomingIceCandidate(data.candidate);
      }
    };

    socket.on('call_answer', handleCallAnswer);
    socket.on('incoming_call', handleIncomingCall);
    socket.on('ice_candidate', handleIceCandidate);

    return () => {
      socket.off('call_answer', handleCallAnswer);
      socket.off('incoming_call', handleIncomingCall);
      socket.off('ice_candidate', handleIceCandidate);
    };
  }, [socket, handleIncomingAnswer, handleIncomingOffer, handleIncomingIceCandidate]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  // Render CallModal at document body to escape navigation context
  return createPortal(
    <>
      <style>{callModalStyles}</style>
      <div className="fixed inset-0 z-[99999] bg-black bg-opacity-75 flex items-center justify-center call-modal-container" style={{ zIndex: 99999 }}>
        {/* Modal Content */}
        <div className="bg-white rounded-none p-8 w-full h-full max-w-none max-h-none shadow-none transform-none overflow-hidden" style={{ position: 'relative', zIndex: 100000 }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {isIncoming ? 'Cuộc gọi đến' : (isCallConnected ? 'Cuộc gọi đã kết nối' : 'Đang gọi...')}
            </h2>
            <p className="text-2xl text-gray-600 mb-2">{otherUser.name}</p>
            <p className="text-lg text-gray-500">
              {callType === 'video' ? 'Cuộc gọi video' : 'Cuộc gọi thoại'}
            </p>
            
            {/* Call Status */}
            {!isIncoming && !isCallConnected && (
              <div className="mt-4 flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-lg text-blue-600 font-medium">Đang kết nối...</span>
              </div>
            )}
            
            {isCallConnected && (
              <div className="mt-4 flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-lg text-green-600 font-medium">Đã kết nối</span>
              </div>
            )}
            
            {isCallActive && (
              <p className="text-2xl font-mono text-blue-600 mt-3">
                {formatDuration(callDuration)}
              </p>
            )}
          </div>

          {/* Connection Status Debug */}
          {isCallActive && (
            <div className="text-center mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                🟢 Cuộc gọi đã kết nối - Đang gọi...
              </p>
              <p className="text-green-600 text-xs mt-1">
                Local: {localStreamRef.current ? '✅' : '❌'} | 
                Remote: {remoteVideoRef.current?.srcObject ? '✅' : '❌'} | 
                Peer: {peerConnectionRef.current ? '✅' : '❌'}
              </p>
            </div>
          )}

          {/* Video Elements (only for video calls) */}
          {callType === 'video' && (
            <div className="mb-8 space-y-6">
              {/* Local Video */}
              <div className="relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-64 bg-gray-900 rounded-xl object-cover border-4 border-blue-500"
                  onError={(e) => {}}
                  onLoadedMetadata={() => {}}
                />
                {isVideoOff && (
                  <div className="absolute inset-0 bg-gray-800 rounded-xl flex items-center justify-center">
                    <VideoOff className="w-16 h-16 text-white" />
                  </div>
                )}
                {/* Local Video Label */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-lg px-4 py-2 rounded-full">
                  Bạn
                </div>
              </div>

              {/* Remote Video */}
              <div className="relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-900 rounded-xl object-cover border-4 border-green-500"
                  onError={(e) => {}}
                  onLoadedMetadata={() => {}}
                />
                {isVideoOff && (
                  <div className="absolute inset-0 bg-gray-800 rounded-xl flex items-center justify-center">
                    <VideoOff className="w-16 h-16 text-white" />
                  </div>
                )}
                {/* Remote Video Label */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-lg px-4 py-2 rounded-full">
                  {otherUser.name}
                </div>
              </div>
            </div>
          )}

          {/* Call Controls */}
          <div 
            className="flex justify-center space-x-6 call-controls" 
            style={{ 
              display: 'flex', 
              visibility: 'visible', 
              opacity: 1,
              position: 'relative',
              zIndex: 10001
            }}
          >
            {/* Call Status Info for Outgoing Calls */}
            {!isIncoming && !isCallActive && (
              <div className="w-full text-center mb-6">
                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-blue-50 rounded-full">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-lg text-blue-600 font-medium">
                    Đang chờ {otherUser.name} trả lời...
                  </span>
                </div>
              </div>
            )}
            {!isCallActive && isIncoming ? (
              <>
                {/* Accept Call Button */}
                <button
                  onClick={handleAcceptCall}
                  className="flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-lg hover:shadow-xl text-lg font-medium"
                  disabled={!onAccept}
                  style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
                >
                  <Phone className="w-6 h-6" />
                  <span>Nhận cuộc gọi</span>
                </button>
                
                {/* Reject Call Button */}
                <button
                  onClick={handleRejectCall}
                  className="flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-lg hover:shadow-xl text-lg font-medium"
                  disabled={!onReject}
                  style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
                >
                  <PhoneOff className="w-6 h-6" />
                  <span>Từ chối</span>
                </button>
              </>
            ) : isCallActive ? (
              <>
                {/* Mute/Unmute Button */}
                <button
                  onClick={toggleMute}
                  className={`flex items-center gap-3 px-6 py-4 rounded-full transition-colors shadow-lg ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  <span className="text-lg font-medium">{isMuted ? 'Bật mic' : 'Tắt mic'}</span>
                </button>

                {/* Video On/Off Button (only for video calls) */}
                {callType === 'video' && (
                  <button
                    onClick={toggleVideo}
                    className={`flex items-center gap-3 px-6 py-4 rounded-full transition-colors shadow-lg ${
                      isVideoOff 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
                    <span className="text-lg font-medium">{isVideoOff ? 'Bật camera' : 'Tắt camera'}</span>
                  </button>
                )}

                {/* End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg hover:shadow-xl text-lg font-medium"
                  disabled={!onEnd}
                >
                  <PhoneOff className="w-6 h-6" />
                  <span>Tắt gọi</span>
                </button>


              </>
            ) : (
              <>
                {/* End Call Button (for outgoing calls) */}
                <button
                  onClick={handleEndCall}
                  className="flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg hover:shadow-xl text-lg font-medium"
                  disabled={!onEnd}
                  style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
                >
                  <PhoneOff className="w-6 h-6" />
                  <span>Tắt gọi</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CallModal; 