import API from './index';

export interface OnboardingData {
  email: string;
  gender: string;
  topics: string[];
}

export const submitOnboarding = async (data: OnboardingData) => {
  try {
    const response = await API.post('/users/onboarding', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetOnboarding = async (email: string) => {
  try {
    const response = await API.post('/users/reset-onboarding', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 