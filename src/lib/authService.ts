import apiClient from '@/config/apiConfig';

interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    phone: string;
  };
  access_token: string;
  refresh_token: string;
}

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

export const login = async (accountInfo: string, passWord: string) => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/userLogin', {
      accountInfo,
      passWord,
    });
    
    // 保存用户信息和令牌到 localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    
    return response.data;
  } catch (error) {
    console.error('处理登录逻辑时遇到预期外的错误：', error);
    throw error;
  }
};
