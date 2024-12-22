import apiClient from '@/config/apiConfig';

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface TagListResponse {
  tags: Tag[];
  total: number;
  page: number;
  page_size: number;
}

export const getTagList = async (params: {
  page: number;
  page_size: number;
  name?: string;
}) => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: TagListResponse;
    }>('/tags', { params });
    return response.data.data;
  } catch (error) {
    console.error('获取标签列表失败:', error);
    throw error;
  }
};

export const createTag = async (data: {
  name: string;
  color: string;
}) => {
  try {
    const response = await apiClient.post('/tags', data);
    return response.data;
  } catch (error) {
    console.error('创建标签失败:', error);
    throw error;
  }
};

export const updateTag = async (id: number, data: {
  name?: string;
  color?: string;
}) => {
  try {
    const response = await apiClient.put(`/tags/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('更新标签失败:', error);
    throw error;
  }
};

export const deleteTag = async (id: number) => {
  try {
    const response = await apiClient.delete(`/tags/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除标签失败:', error);
    throw error;
  }
};
