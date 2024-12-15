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

// 定义管理员列表响应接口
interface AdminListResponse {
  code: number;
  data: {
    admins: Admin[];
    total: number;
  };
  message: string;
}

interface Admin {
  id: number;
  user_id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  last_login_time: string;
  last_login_ip: string;
}

// 获取管理员列表
export const getAdminList = async () => {
  try {
    const response = await apiClient.get<AdminListResponse>('/admin/listAdmin');
    return response.data.data.admins; // 返回 data.data.admins
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    throw error;
  }
};

// 添加管理员
export const addAdmin = async (userId: number, role: string) => {
  try {
    const response = await apiClient.post('/admin/addAdmin', {
      user_id: userId,
      role
    });
    return response.data;
  } catch (error) {
    console.error('添加管理员失败:', error);
    throw error;
  }
};

// 移除管理员
export const removeAdmin = async (userId: number) => {
  try {
    const response = await apiClient.delete('/admin/removeAdmin', {
      data: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error('移除管理员失败:', error);
    throw error;
  }
}; 