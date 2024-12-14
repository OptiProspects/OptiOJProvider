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
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  province?: string;
  city?: string;
  real_name?: string;
  school?: string;
}) => {
  try {
    const formattedData = {
      ...data,
      birthday: data.birthday 
        ? data.birthday.toISOString().slice(0, 19).replace('T', ' ')
        : undefined,
    };
    
    const response = await apiClient.put('/user/updateProfile', formattedData);
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

export const removeAvatar = async () => {
  try {
    const response = await apiClient.delete('/user/removeAvatar');
    return response.data;
  } catch (error) {
    console.error('删除头像失败:', error);
    throw error;
  }
};

interface UserProfile {
  id: number;
  user_id: number;
  bio: string;
  gender: 'male' | 'female' | 'other';
  school: string;
  birthday: string;
  province: string;
  city: string;
  real_name: string;
  create_at: string;
  update_at: string;
}

export interface UserData {
  user: {
    id: number;
    username: string;
    email: string;
    phone: string;
    avatar: string;
    profile: UserProfile;
  }
}

export const getUserData = async () => {
  try {
    const response = await apiClient.get<UserData>('/user/globalData');
    return response.data;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    throw error;
  }
};

interface ProvincesResponse {
  provinces: string[];
}

export const getProvinces = async () => {
  try {
    const response = await apiClient.get<ProvincesResponse>('/user/getProvinces');
    return response.data.provinces;
  } catch (error) {
    console.error('获取省份列表失败:', error);
    throw error;
  }
};

export const getCities = async (province: string) => {
  try {
    const response = await apiClient.get<{ cities: string[] }>(`/user/getCities?province=${province}`);
    return response.data.cities;
  } catch (error) {
    console.error('获取城市列表失败:', error);
    throw error;
  }
};
