import apiClient, { getApiEndpoint } from '@/config/apiConfig';

export async function logoutService() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('未找到刷新令牌');
    }

    const response = await fetch(`${getApiEndpoint()}/sessions/logoutSession`, {
        method: 'POST',
        headers: {
            'Authorization': refreshToken,
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '退出登录失败');
    }

    // 清除本地存储的令牌
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
}

interface DeviceInfo {
  user_agent: string;
  ip: string;
  last_active: string;
  last_refresh: string;
}

interface SessionResponse {
  session_id: string;
  device_info: DeviceInfo;
  created_at: string;
}

export const fetchActiveSessions = async () => {
  try {
    const response = await apiClient.get('/sessions/activeSessions', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data.sessions as SessionResponse[];
  } catch (error) {
    console.error('获取活跃会话失败:', error);
    throw error;
  }
};

export const logoutAllDevices = async () => {
  try {
    const response = await apiClient.post('/sessions/logoutAllSessions', null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('退出所有设备失败:', error);
    throw error;
  }
};

export const revokeSession = async (sessionId: string) => {
  try {
    const response = await apiClient.delete(`/sessions/logoutSession/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('吊销会话失败:', error);
    throw error;
  }
};
