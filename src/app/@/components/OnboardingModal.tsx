'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

// Loading skeleton component with improved design
const TopicSkeleton = () => (
  <div className="relative p-4 rounded-2xl border-2 border-gray-200 overflow-hidden h-32">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    <div className="relative z-10 text-center h-full flex flex-col items-center justify-center">
      <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mb-3 animate-pulse"></div>
      <div className="w-20 h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full animate-pulse"></div>
      <div className="w-16 h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mt-2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
    </div>
  </div>
);

// Sound effects utility
const playSound = (type: 'click' | 'select' | 'success' | 'error') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
      click: 800,
      select: 1000,
      success: 1200,
      error: 400
    };
    
    const durations = {
      click: 0.1,
      select: 0.15,
      success: 0.3,
      error: 0.2
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + durations[type]);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + durations[type]);
  } catch (error) {
    // Fallback for browsers that don't support Web Audio API
    console.log('Sound effect:', type);
  }
};

const topics = [
  { 
    id: 'music', 
    name: 'Âm nhạc', 
    icon: '🎵', 
    image: 'https://picsum.photos/400/300?random=1'
  },
  { 
    id: 'sports', 
    name: 'Thể thao', 
    icon: '⚽', 
    image: 'https://picsum.photos/400/300?random=2'
  },
  { 
    id: 'travel', 
    name: 'Du lịch', 
    icon: '✈️', 
    image: 'https://picsum.photos/400/300?random=3'
  },
  { 
    id: 'technology', 
    name: 'Công nghệ', 
    icon: '💻', 
    image: 'https://picsum.photos/400/300?random=4'
  },
  { 
    id: 'food', 
    name: 'Ẩm thực', 
    icon: '🍕', 
    image: 'https://picsum.photos/400/300?random=5'
  },
  { 
    id: 'fashion', 
    name: 'Thời trang', 
    icon: '👗', 
    image: 'https://picsum.photos/400/300?random=6'
  },
];

export default function OnboardingModal() {
  const { data: session, update } = useSession();
  const [gender, setGender] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [confetti, setConfetti] = useState<Array<{id: number, x: number, y: number, color: string, delay: number}>>([]);

  useEffect(() => {
    console.log('Session in OnboardingModal:', session);
    console.log('User data:', session?.user);
    
    // Chỉ hiển thị modal khi đã đăng nhập và chưa onboarded
    if (session?.user) {
      const onboarded = (session.user as any).onboarded;
      console.log('Onboarded status:', onboarded);
      
      if (onboarded === false || onboarded === null || onboarded === undefined) {
        console.log('Showing onboarding modal');
        setShowModal(true);
      } else {
        console.log('User already onboarded, hiding modal');
        setShowModal(false);
      }
    } else {
      console.log('Not authenticated or no user, hiding modal');
      setShowModal(false);
    }
  }, [session]);

  const handleTopicToggle = (topicId: string) => {
    const isSelected = selectedTopics.includes(topicId);
    setSelectedTopics(prev => 
      isSelected
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
    playSound(isSelected ? 'click' : 'select');
  };

  const handleNext = () => {
    if (currentStep === 1 && gender) {
      playSound('select');
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      playSound('click');
      setCurrentStep(1);
    }
  };

  const handleImageLoad = (topicId: string) => {
    setImageLoadStates(prev => ({ ...prev, [topicId]: true }));
  };

  // Preload images when component mounts
  useEffect(() => {
    topics.forEach(topic => {
      const img = new Image();
      img.onload = () => handleImageLoad(topic.id);
      img.onerror = () => handleImageLoad(topic.id); // Fallback nếu ảnh lỗi
      img.src = topic.image;
    });
  }, []);

  // Generate confetti effect
  const generateConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1000
    }));
    setConfetti(newConfetti);
  };

  const handleSubmit = async () => {
    if (!gender.trim() || selectedTopics.length === 0) {
      playSound('error');
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setLoading(true);
    try {
      // Gọi trực tiếp đến backend server
      await axios.post(`http://localhost:5001/api/users/onboarding`, {
        email: session?.user?.email,
        gender: gender.trim(),
        topics: selectedTopics.join(','),
      });
      
      playSound('success');
      
      // Show success animation
      setShowSuccess(true);
      generateConfetti();
      
      // Wait for animation to complete then close modal
      setTimeout(async () => {
        try {
          // Gọi API để lấy thông tin user mới nhất
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session?.user?.email })
          });
          
          if (refreshResponse.ok) {
            const userData = await refreshResponse.json();
            console.log('Refreshed user data:', userData);
            
            if (userData.user.onboarded === true) {
              console.log('User successfully onboarded, closing modal');
              // Force update session
              await update();
              setShowModal(false);
              setShowSuccess(false);
              setConfetti([]);
            } else {
              console.log('User still not onboarded, keeping modal open');
              setShowSuccess(false);
              setConfetti([]);
            }
          } else {
            console.log('Failed to refresh user data, closing modal anyway');
            setShowModal(false);
            setShowSuccess(false);
            setConfetti([]);
          }
        } catch (error) {
          console.error('Error updating session:', error);
          setShowModal(false);
          setShowSuccess(false);
          setConfetti([]);
        }
      }, 3000);
      
    } catch (err) {
      console.error('Onboarding failed:', err);
      playSound('error');
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-white flex justify-center items-center z-50 p-4">
      {/* Confetti Effect */}
      {showSuccess && confetti.map((piece) => (
        <div
          key={piece.id}
          className="fixed w-2 h-2 rounded-full pointer-events-none animate-confetti"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}ms`,
            zIndex: 60
          }}
        />
      ))}
      
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-55">
          {/* Sparkles */}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2000}ms`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
          
          <div className="bg-white rounded-3xl p-8 text-center animate-success-pulse shadow-2xl relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 opacity-20 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Chúc mừng!</h2>
              <p className="text-gray-600">Bạn đã hoàn thành onboarding thành công</p>
              <div className="mt-4 text-sm text-gray-500 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Đang chuyển hướng...
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transition-all duration-500 ${
        showSuccess ? 'animate-fade-out scale-95 opacity-50' : ''
      }`}>
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-rotate {
            animation: rotate 2s linear infinite;
          }
          
          @keyframes confettiFall {
            0% {
              transform: translateY(-10px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          
          @keyframes successPulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
          
          @keyframes fadeOut {
            from {
              opacity: 1;
              transform: scale(1);
            }
            to {
              opacity: 0;
              transform: scale(0.8);
            }
          }
          
          .animate-confetti {
            animation: confettiFall 3s ease-in forwards;
          }
          
          .animate-success-pulse {
            animation: successPulse 2s ease-in-out infinite;
          }
          
          .animate-fade-out {
            animation: fadeOut 0.5s ease-out forwards;
          }
        `}</style>
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-center animate-float">Chào mừng bạn!</h2>
            <p className="text-center text-gray-300 mt-2">Hãy cho chúng tôi biết thêm về bạn</p>
          </div>
          
                      {/* Progress Steps */}
            <div className="flex justify-center items-center mt-6 space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                currentStep >= 1 ? 'bg-white text-gray-800 scale-110 shadow-lg' : 'bg-white/30 text-white'
              }`} style={{ animation: currentStep >= 1 ? 'scaleIn 0.5s ease-out' : 'none' }}>
                1
              </div>
              <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
                currentStep >= 2 ? 'bg-white' : 'bg-white/30'
              }`} style={{ animation: currentStep >= 2 ? 'slideIn 0.8s ease-out' : 'none' }}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                currentStep >= 2 ? 'bg-white text-gray-800 scale-110 shadow-lg' : 'bg-white/30 text-white'
              }`} style={{ animation: currentStep >= 2 ? 'scaleIn 0.5s ease-out' : 'none' }}>
                2
              </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 1 ? (
            // Step 1: Gender Selection
            <div className="space-y-6" style={{ animation: 'slideIn 0.5s ease-out' }}>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Bạn là...</h3>
                <p className="text-gray-600">Chọn giới tính của bạn</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setGender('male');
                    playSound('select');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    gender === 'male'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-md'
                  }`}
                  style={{ animationDelay: '0.1s', animation: 'fadeInUp 0.6s ease-out forwards' }}
                >
                  <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-110 animate-bounce" style={{ animationDelay: '0.5s' }}>👨</div>
                  <div className="font-semibold">Nam</div>
                </button>
                
                <button
                  onClick={() => {
                    setGender('female');
                    playSound('select');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    gender === 'female'
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-md'
                  }`}
                  style={{ animationDelay: '0.2s', animation: 'fadeInUp 0.6s ease-out forwards' }}
                >
                  <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-110 animate-bounce" style={{ animationDelay: '0.6s' }}>👩</div>
                  <div className="font-semibold">Nữ</div>
                </button>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNext}
                  disabled={!gender}
                  className="bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center">
                    Tiếp theo
                    <svg className="w-4 h-4 ml-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Topics Selection
            <div className="space-y-6" style={{ animation: 'scaleIn 0.5s ease-out' }}>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Sở thích của bạn</h3>
                <p className="text-gray-600">Chọn những chủ đề bạn quan tâm (có thể chọn nhiều)</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {topics.map((topic, index) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden group h-32 transform hover:scale-105 ${
                      selectedTopics.includes(topic.id)
                        ? 'border-gray-800 ring-2 ring-gray-200 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* Loading Skeleton */}
                    {!imageLoadStates[topic.id] && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        <div className="h-full flex flex-col items-center justify-center relative z-10">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mb-3 animate-pulse"></div>
                          <div className="w-20 h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-16 h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mt-2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Fallback Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    
                    {/* Background Image */}
                    <img
                      src={topic.image}
                      alt={topic.name}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                        imageLoadStates[topic.id] ? 'opacity-100' : 'opacity-0'
                      } group-hover:scale-110`}
                      onLoad={() => handleImageLoad(topic.id)}
                      onError={() => {
                        console.log(`Failed to load image for ${topic.name}`);
                        handleImageLoad(topic.id); // Vẫn set loaded để ẩn skeleton
                      }}
                      crossOrigin="anonymous"
                    />
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-all duration-300 ${
                      imageLoadStates[topic.id] ? 'bg-black/30' : 'bg-transparent'
                    } group-hover:bg-black/20`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center h-full flex flex-col items-center justify-center">
                      <div className={`text-3xl mb-2 transition-all duration-300 ${
                        imageLoadStates[topic.id] ? 'drop-shadow-lg scale-100' : 'scale-75'
                      }`}>
                        {topic.icon}
                      </div>
                      <div className={`font-semibold transition-all duration-300 ${
                        imageLoadStates[topic.id] ? 'text-white drop-shadow-lg scale-100' : 'text-gray-400 scale-90'
                      }`}>
                        {topic.name}
                      </div>
                      
                      {/* Checkmark */}
                      {selectedTopics.includes(topic.id) && (
                        <div 
                          className="absolute top-2 right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center shadow-lg animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="text-gray-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                  </span>
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedTopics.length === 0}
                  className="bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center">
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        Hoàn thành
                        <svg className="w-4 h-4 ml-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
