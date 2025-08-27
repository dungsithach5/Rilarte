import API from './index';

export interface OnboardingData {
  email: string;
  gender: string;
  topics: string[];
}

export const submitOnboarding = async (data: OnboardingData) => {
  try {
    // Gọi trực tiếp backend không qua API interceptor (không cần token)
    const response = await fetch('http://localhost:5001/api/users/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const resetOnboarding = async (email: string) => {
  try {
    // Gọi trực tiếp backend không qua API interceptor (không cần token)
    const response = await fetch('http://localhost:5001/api/users/reset-onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}; 