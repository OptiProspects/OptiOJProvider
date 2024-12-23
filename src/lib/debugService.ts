import apiClient from '@/config/apiConfig';

export interface DebugResult {
  status: string;
  time_used: number;
  memory_used: number;
  output: string;
  error_message: string;
}

export interface DebugRequest {
  language: string;
  code: string;
  input: string;
  time_limit: number;
  memory_limit: number;
}

export const debugCode = async (data: DebugRequest) => {
  try {
    const response = await apiClient.post<{
      code: number;
      data: DebugResult;
    }>('/submissions/debug', data);
    return response.data.data;
  } catch (error) {
    console.error('代码调试失败:', error);
    throw error;
  }
}; 