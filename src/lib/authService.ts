import apiClient from '@/config/apiConfig';

export const register = async (data: {
  userName: string;
  passWord: string;
  requestEmail?: string;
  requestPhone?: string;
  verificationCode: string;
  verificationType: 'email' | 'phone';
}) => {
  try {
    const response = await apiClient.post('/auth/userRegister', data);
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};
