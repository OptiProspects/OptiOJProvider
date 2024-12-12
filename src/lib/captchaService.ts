import apiClient from '@/config/apiConfig';

export const verifyCaptcha = async (result: any) => {
  try {
    const response = await apiClient.post('/verification/validateCaptcha', result);
    return response.data;
  } catch (error) {
    console.error('Error verifying captcha:', error);
    throw error;
  }
};

export const sendVerificationCode = async (requestValue: string, requestType: 'email' | 'phone', captchaID: string) => {
  try {
    const response = await apiClient.post('/verification/sendVerificationCode', {
      requestValue,
      requestType,
      captchaID,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};
