import apiClient from '@/config/apiConfig';

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  status: 'normal' | 'banned';
  created_at: string;
  updated_at: string;
  last_login_time: string;
  last_login_ip: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

export const getUserList = async (
  page: number = 1,
  page_size: number = 10,
  filters?: { [key: string]: any }
) => {
  try {
    const response = await apiClient.get<UserListResponse>('/admin/users', {
      params: {
        page,
        page_size,
        ...filters
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
};

export const deleteUser = async (userId: number) => {
  try {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('删除用户失败:', error);
    throw error;
  }
};

interface BanUserRequest {
  user_id: number;
  ban_reason: string;
  ban_expires?: string; // ISO 格式的日期字符串
}

export const banUser = async (data: BanUserRequest) => {
  try {
    const response = await apiClient.post(`/admin/users/${data.user_id}/ban`, data);
    return response.data;
  } catch (error) {
    console.error('封禁用户失败:', error);
    throw error;
  }
};

export const unbanUser = async (userId: number) => {
  try {
    const response = await apiClient.post(`/admin/users/${userId}/unban`);
    return response.data;
  } catch (error) {
    console.error('解封用户失败:', error);
    throw error;
  }
}; 