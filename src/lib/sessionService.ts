import { getApiEndpoint } from '@/config/apiConfig';

export async function logout() {
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
