import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 不需要登录的白名单路由
const publicRoutes = ['/', '/login', '/register', '/about'];

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 如果是 401 错误且不是刷新 token 的请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // 尝试刷新 token
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/refreshToken`,
          {
            headers: {
              'Authorization': refreshToken
            }
          }
        );

        const { access_token, refresh_token } = response.data;
        
        // 保存新的 token
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
        
        // 重试原始请求
        originalRequest.headers['Authorization'] = access_token;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清除所有认证信息
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // 只在非白名单路由时跳转到登录页
        const currentPath = window.location.pathname;
        if (!publicRoutes.includes(currentPath)) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
