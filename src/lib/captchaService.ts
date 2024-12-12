import axios from 'axios';

export const verifyCaptcha = async (result: any) => {
  try {
    const response = await axios.post('http://localhost:8080/verification/validateCaptcha', result, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying captcha:', error);
    throw error;
  }
};

export const sendVerificationCode = async (requestValue: string, requestType: 'email' | 'phone', captchaID: string) => {
  try {
    const response = await axios.post('http://localhost:8080/verification/sendVerificationCode', {
      requestValue,
      requestType,
      captchaID,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};
