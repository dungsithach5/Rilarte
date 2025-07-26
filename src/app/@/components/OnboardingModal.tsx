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
    name: 'Music', 
    icon: '🎵', 
    image: 'https://cdn.pixabay.com/photo/2023/12/22/16/29/sheet-music-8463988_1280.jpg'
  },
  { 
    id: 'sports', 
    name: 'Sports', 
    icon: '⚽', 
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5t7DgML9dvoEAt09fUpLCzCUnMTpu8qEPug&s'
  },
  { 
    id: 'travel', 
    name: 'Travel', 
    icon: '✈️', 
    image: 'https://igotravel.vn/wwwroot/resources/upload/tong-hop-cac-hinh-thuc-du-lich-pho-bien-nhat-tai-viet-nam.png'
  },
      { 
      id: 'technology', 
      name: 'Technology', 
      icon: '💻', 
      image: 'https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/08/background-cong-nghe-25-1.jpg'
    },
    { 
      id: 'food', 
      name: 'Food', 
      icon: '🍕', 
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnRaeSrU8T7sv9_m4m0fgqfG3bHAHBvnS2UA&s'
    },
      { 
      id: 'fashion', 
      name: 'Fashion', 
      icon: '👗', 
      image: 'https://m.media-amazon.com/images/I/61NduGwyh5L._UF1000,1000_QL80_.jpg'
    },
];

export default function OnboardingModal() {
  const { data: session, status, update } = useSession();
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
    console.log('Auth status:', status);
    
    // Không hiện modal khi đang loading
    if (status === 'loading') {
      console.log('Auth still loading, hiding modal');
      setShowModal(false);
      return;
    }
    
    // Chỉ hiển thị modal khi đã đăng nhập (status === 'authenticated') và chưa onboarded
    if (status === 'authenticated' && session?.user) {
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
      console.log('Not authenticated yet, hiding modal. Status:', status);
      setShowModal(false);
    }
  }, [session, status]);

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
      alert('Please fill in all information!');
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
      alert('An error occurred, please try again!');
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
          className="fixed w-2 h-2 rounded-full pointer-events-none animate-confetti-fall"
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
              <p className="text-gray-600">You have successfully completed onboarding</p>
              <div className="mt-4 text-sm text-gray-500 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Redirecting...
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transition-all duration-500 ${
        showSuccess ? 'animate-fade-out scale-95 opacity-50' : ''
      }`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-center animate-float">Welcome!</h2>
            <p className="text-center text-gray-300 mt-2">Tell us more about yourself</p>
          </div>
          
                      {/* Progress Steps */}
            <div className="flex justify-center items-center mt-6 space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                currentStep >= 1 ? 'bg-white text-gray-800 scale-110 shadow-lg' : 'bg-white/30 text-white'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
                currentStep >= 2 ? 'bg-white' : 'bg-white/30'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                currentStep >= 2 ? 'bg-white text-gray-800 scale-110 shadow-lg' : 'bg-white/30 text-white'
              }`}>
                2
              </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 1 ? (
            // Step 1: Gender Selection
            <div className="space-y-6 animate-slide-in">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">You are...</h3>
                <p className="text-gray-600">Select your gender</p>
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
                  }`}>
                  <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-110 animate-bounce">👨</div>
                  <div className="font-semibold">Male</div>
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
                  }`}>
                  <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-110 animate-bounce">👩</div>
                  <div className="font-semibold">Female</div>
                </button>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNext}
                  disabled={!gender}
                  className="bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                                      <span className="flex items-center">
                      Next
                      <svg className="w-4 h-4 ml-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Topics Selection
            <div className="space-y-6 animate-scale-in">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Interests</h3>
                <p className="text-gray-600">Select topics you're interested in (you can choose multiple)</p>
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
                    }`}>
                    {/* Loading Skeleton */}
                    {!imageLoadStates[topic.id] && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        <div className="h-full flex flex-col items-center justify-center relative z-10">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mb-3 animate-pulse"></div>
                          <div className="w-20 h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-16 h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mt-2 animate-pulse"></div>
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
                          className="absolute top-2 right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center shadow-lg animate-bounce">
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
                    Back
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
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete
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
