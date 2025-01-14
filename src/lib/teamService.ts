import apiClient from '@/config/apiConfig';
import { getApiEndpoint } from '@/config/apiConfig';

// 团队成员接口
export interface TeamMember {
  team_id?: number;
  user_id: number;
  username: string;
  real_name?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

// 团队详情接口
export interface TeamDetail {
  id: number;
  name: string;
  description: string;
  avatar: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  member_count: number;
  user_role?: 'owner' | 'admin' | 'member';
  is_joined?: boolean;
  owner?: {
    id: number;
    username: string;
    email: string;
    real_name?: string;
    created_at: string;
    updated_at: string;
  };
}

// 团队成员列表响应接口
export interface TeamMemberListResponse {
  members: TeamMember[];
  total: number;
  page: number;
  page_size: number;
}

// 创建团队
export const createTeam = async (data: {
  name: string;
  description?: string;
  avatar?: string;
}) => {
  try {
    const response = await apiClient.post<{
      code: number;
      message: string;
      data: {
        team_id: number;
      }
    }>('/teams/createTeam', data);
    return response.data;
  } catch (error) {
    console.error('创建团队失败:', error);
    throw error;
  }
};

// 更新团队信息
export const updateTeam = async (
  teamId: number,
  data: {
    name?: string;
    description?: string;
    avatar?: string;
  }
) => {
  try {
    const response = await apiClient.put<{
      code: number;
      message: string;
    }>(`/teams/${teamId}/updateTeam`, data);
    return response.data;
  } catch (error) {
    console.error('更新团队信息失败:', error);
    throw error;
  }
};

// 获取团队详情
export const getTeamDetail = async (teamId: number) => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: TeamDetail;
    }>(`/teams/${teamId}/getTeamDetail`);
    return response.data.data;
  } catch (error) {
    console.error('获取团队详情失败:', error);
    throw error;
  }
};

// 获取团队列表
export const getTeamList = async (params: {
  page: number;
  page_size: number;
  scope?: 'all' | 'joined';
  keyword?: string;
}) => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: {
        teams: TeamDetail[];
        total: number;
        page: number;
        page_size: number;
      }
    }>('/teams/getTeamList', { params });
    return response.data.data;
  } catch (error) {
    console.error('获取团队列表失败:', error);
    throw error;
  }
};

// 创建团队邀请
export const createTeamInvitation = async (teamId: number) => {
  try {
    const response = await apiClient.post<{
      code: number;
      data: {
        id: number;
        team_id: number;
        code: string;
        expires_at: string;
        created_by: number;
        created_at: string;
      }
    }>(`/teams/${teamId}/createInvitation`);
    return response.data.data;
  } catch (error) {
    console.error('创建团队邀请失败:', error);
    throw error;
  }
};

// 加入团队
export const joinTeam = async (invitationCode: string) => {
  try {
    const response = await apiClient.post<{
      code: number;
      message: string;
    }>('/teams/join', {
      code: invitationCode
    });
    return response.data;
  } catch (error) {
    console.error('加入团队失败:', error);
    throw error;
  }
};

// 更新团队成员角色
export const updateTeamMemberRole = async (
  teamId: number,
  userId: number,
  role: 'admin' | 'member'
) => {
  try {
    const response = await apiClient.put(`/teams/${teamId}/members/role`, {
      user_id: userId,
      role
    });
    return response.data;
  } catch (error) {
    console.error('更新团队成员角色失败:', error);
    throw error;
  }
};

// 上传团队头像
export const uploadTeamAvatar = async (teamId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post(`/teams/${teamId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('上传团队头像失败:', error);
    throw error;
  }
};

// 获取团队头像
export const getTeamAvatar = async (teamId: number) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/avatar`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('获取团队头像失败:', error);
    throw error;
  }
};

// 删除团队头像
export const deleteTeamAvatar = async (teamId: number) => {
  try {
    const response = await apiClient.delete(`/teams/${teamId}/avatar`);
    return response.data;
  } catch (error) {
    console.error('删除团队头像失败:', error);
    throw error;
  }
};

// 获取团队头像URL
export const getTeamAvatarUrl = (team: TeamDetail | { id: number, avatar: string }) => {
  // 如果团队有头像，返回头像URL
  if (team.avatar) {
    return `${getApiEndpoint()}/teams/avatar/${team.avatar}`;
  }
  // 如果没有头像，返回空字符串
  return '';
};

// 删除团队
export const deleteTeam = async (teamId: number) => {
  try {
    const response = await apiClient.delete(`/teams/${teamId}/deleteTeam`);
    return response.data;
  } catch (error) {
    console.error('删除团队失败:', error);
    throw error;
  }
};

// 移除团队成员
export const removeTeamMember = async (teamId: number, userId: number) => {
  try {
    const response = await apiClient.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error('移除团队成员失败:', error);
    throw error;
  }
};

// 获取团队成员列表
export const getTeamMembers = async (teamId: number, params: {
  page: number;
  page_size: number;
}) => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: TeamMemberListResponse;
    }>(`/teams/${teamId}/getMembers`, { params });
    return response.data.data;
  } catch (error) {
    console.error('获取团队成员列表失败:', error);
    throw error;
  }
};

// 发送团队申请
export const sendTeamApply = async (teamId: number, message: string) => {
  try {
    const response = await apiClient.post<{
      code: number;
      message: string;
    }>('/teams/sendApply', {
      team_id: teamId,
      message
    });
    return response.data;
  } catch (error) {
    console.error('发送团队申请失败:', error);
    throw error;
  }
};

// 处理团队申请
export const handleTeamApply = async (data: {
  application_id: number;
  status: 'approved' | 'rejected';
  message: string;
}) => {
  try {
    const response = await apiClient.post('/teams/handleApply', data);
    return response.data;
  } catch (error) {
    console.error('处理团队申请失败:', error);
    throw error;
  }
}; 