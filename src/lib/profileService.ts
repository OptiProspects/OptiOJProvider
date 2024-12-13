import apiClient from '@/config/apiConfig';

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await apiClient.post('/user/uploadAvatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('上传头像失败:', error);
    throw error;
  }
};

export const updateProfile = async (data: {
  username?: string;
  nickname?: string;
  email?: string;
}) => {
  try {
    const response = await apiClient.post('/user/updateProfile', data);
    return response.data;
  } catch (error) {
    console.error('更新个人资料失败:', error);
    throw error;
  }
};

export const getAvatar = async () => {
  try {
    const response = await apiClient.get('/user/getAvatar', {
      responseType: 'blob'
    });
    const avatarUrl = URL.createObjectURL(response.data);
    return { avatarUrl };
  } catch (error) {
    console.error('获取头像失败:', error);
    throw error;
  }
};
