import apiClient from '@/config/apiConfig';

export interface Tag {
  id: number;
  name: string;
  color: string;
  category_id: number | undefined;
  created_at: string;
  updated_at: string;
}

export interface TagCategory {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TagCategoryDetail extends TagCategory {
  children: TagCategoryDetail[];
}

export interface TagListResponse {
  tags: Tag[];
  total: number;
  page: number;
  page_size: number;
  categories: any[];
}

export interface TagCategoryListResponse {
  categories: TagCategoryDetail[] | null;
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
    }>('/tags/getTagList', { params });
    
    // 确保返回数据的完整性
    return {
      tags: response.data.data.tags || [],
      total: response.data.data.total || 0,
      page: response.data.data.page || 1,
      page_size: response.data.data.page_size || 10,
      categories: response.data.data.categories || []
    };
  } catch (error) {
    console.error('获取标签列表失败:', error);
    throw error;
  }
};

export const createTag = async (data: {
  name: string;
  color: string;
  category_id?: number;
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
  category_id?: number | null;
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

// 标签分类相关接口
export const createTagCategory = async (data: {
  name: string;
  description?: string;
  parent_id?: number;
}) => {
  try {
    const response = await apiClient.post('/tags/categories/createTagCategory', data);
    return response.data;
  } catch (error) {
    console.error('创建标签分类失败:', error);
    throw error;
  }
};

export const getTagCategoryList = async (params?: {
  parent_id?: number;
}) => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: TagCategoryListResponse;
    }>('/tags/categories/getTagCategoryList', { params });
    
    // 确保返回数据的完整性
    return {
      categories: response.data.data.categories || []
    };
  } catch (error) {
    console.error('获取标签分类列表失败:', error);
    throw error;
  }
};

export const getTagCategoryTree = async () => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: TagCategoryListResponse;
    }>('/tags/categories/getTagCategoryTree');
    
    // 确保返回数据的完整性
    return {
      categories: response.data.data.categories || []
    };
  } catch (error) {
    console.error('获取标签分类树失败:', error);
    throw error;
  }
};

export const updateTagCategory = async (id: number, data: {
  name?: string;
  description?: string;
  parent_id?: number | null;
}) => {
  try {
    const response = await apiClient.put(`/tags/categories/${id}/updateTagCategory`, data);
    return response.data;
  } catch (error) {
    console.error('更新标签分类失败:', error);
    throw error;
  }
};

export const deleteTagCategory = async (id: number) => {
  try {
    const response = await apiClient.delete(`/tags/categories/${id}/deleteTagCategory`);
    return response.data;
  } catch (error) {
    console.error('删除标签分类失败:', error);
    throw error;
  }
};
