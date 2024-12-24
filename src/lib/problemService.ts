import apiClient from '@/config/apiConfig';

export interface Problem {
  id: number;
  title: string;
  difficulty_system: "normal" | "oi";
  difficulty: Difficulty;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  categories: Array<{
    id: number;
    name: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    color: string;
    created_at: string;
  }>;
}

export interface ProblemListResponse {
  code: number;
  data: {
    problems: Problem[];
    total: number;
    page: number;
    page_size: number;
  };
}

export const getProblemList = async (params: {
  page: number;
  page_size: number;
  title?: string;
  difficulty?: string;
  category_id?: number;
  tag_ids?: number[];
  is_public?: boolean;
}) => {
  try {
    const response = await apiClient.get<ProblemListResponse>('/problems', { params });
    return response.data.data;
  } catch (error) {
    console.error('获取题目列表失败:', error);
    throw error;
  }
};

export const deleteProblem = async (problemId: number) => {
  try {
    const response = await apiClient.delete(`/problems/${problemId}`);
    return response.data;
  } catch (error) {
    console.error('删除题目失败:', error);
    throw error;
  }
};

// 添加创建题目的接口类型
export type CreateProblemData = {
  title: string
  description: string
  input_description: string
  output_description: string
  samples: string
  hint?: string
  source?: string
  difficulty: string
  time_limit: number
  memory_limit: number
  is_public: boolean
  category_ids: number[]
  tag_ids: number[]
}

// 添加创建题目的方法
export const createProblem = async (data: CreateProblemData) => {
  try {
    const response = await apiClient.post('/problems', data);
    return response.data;
  } catch (error) {
    console.error('创建题目失败:', error);
    throw error;
  }
};

// 添加测试用例相关的接口类型
export interface TestCase {
  id: number;
  problem_id: number;
  input_file: string;
  output_file: string;
  is_sample: boolean;
  created_at: string;
}

// 获取测试用例列表
export const getTestCases = async (problemId: number) => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: TestCase[];
    }>(`/testcases/problem/${problemId}`);
    return response.data.data;
  } catch (error) {
    console.error('获取测试用例列表失败:', error);
    throw error;
  }
};

// 上传测试用例
export const uploadTestCase = async (data: {
  problem_id: number;
  input: File;
  output: File;
  is_sample: boolean;
}) => {
  try {
    const formData = new FormData();
    formData.append('problem_id', String(data.problem_id));
    formData.append('input', data.input);
    formData.append('output', data.output);
    formData.append('is_sample', String(data.is_sample));

    const response = await apiClient.post('/testcases', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('上传测试用例失败:', error);
    throw error;
  }
};

// 删除测试用例
export const deleteTestCase = async (id: number) => {
  try {
    const response = await apiClient.delete(`/testcases/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除测试用例失败:', error);
    throw error;
  }
};

// 添加前台展示相关的接口类型
export interface PublicProblem {
  id: number;
  title: string;
  difficulty_system: "normal" | "oi";
  difficulty: Difficulty;
  time_limit: number;
  memory_limit: number;
  is_public: boolean;
  created_at: string;
  categories: Array<{
    id: number;
    name: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    color: string;
    created_at: string;
  }>;
  accept_count: number;
  submission_count: number;
  accept_rate: number;
  user_status: 'accepted' | 'attempted' | null;
}

export interface ProblemDetail {
  id: number;
  title: string;
  description: string;
  input_description: string;
  output_description: string;
  samples: string;
  hint?: string;
  source?: string;
  difficulty_system: "normal" | "oi";
  difficulty: Difficulty;
  time_limit: number;
  memory_limit: number;
  is_public: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  categories: Array<{
    id: number;
    name: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    color: string;
    created_at: string;
  }>;
}

// 获取公开题目列表
export const getPublicProblemList = async (params: {
  page: number;
  page_size?: number;
  title?: string;
  difficulty?: string;
  category_id?: number;
  tag_ids?: number[];
}) => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: {
        problems: PublicProblem[];
        total: number;
        page: number;
        page_size: number;
      };
    }>('/problems', { params });
    return response.data.data;
  } catch (error) {
    console.error('获取题目列表失败:', error);
    throw error;
  }
};

// 获取题目详情
export const getProblemDetail = async (id: number) => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: ProblemDetail;
    }>(`/problems/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('获取题目详情失败:', error);
    throw error;
  }
};

// 添加测试用例内容的接口类型
export interface TestCaseContent {
  id: number;
  local_id: number;
  problem_id: number;
  input: string;
  output: string;
  is_sample: boolean;
}

// 获取测试用例内容
export const getTestCaseContent = async (id: number) => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: TestCaseContent;
    }>(`/testcases/${id}/content`);
    return response.data.data;
  } catch (error) {
    console.error('获取测试用例内容失败:', error);
    throw error;
  }
};

// 添加更新题目的接口类型
export type UpdateProblemData = CreateProblemData

// 添加更新题目的方法
export const updateProblem = async (id: number, data: UpdateProblemData) => {
  try {
    const response = await apiClient.put(`/problems/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('更新题目失败:', error);
    throw error;
  }
};

// 添加难度系统类型
export type DifficultySystem = "normal" | "oi"

// 添加难度等级类型
export type NormalDifficulty = "easy" | "medium" | "hard" | "unrated"
export type OIDifficulty = "beginner" | "basic" | "basicplus" | "advanced" | "advplus" | "provincial" | "noi" | "unrated"
export type Difficulty = NormalDifficulty | OIDifficulty

export interface DifficultyInfo {
  code: string;
  display: string;
}

export interface SystemInfo {
  system: DifficultySystem;
  name: string;
  difficulties: DifficultyInfo[];
}

export interface DifficultySystemResponse {
  current_system: DifficultySystem;
  systems: SystemInfo[];
}

// 获取当前难度系统的方法
export const getCurrentDifficultySystem = async () => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: DifficultySystemResponse;
    }>('/problems/difficulty-system');
    return response.data.data;
  } catch (error) {
    console.error('获取当前难度系统失败:', error);
    throw error;
  }
};

// 添加难度系统切换的方法
export const switchDifficultySystem = async (system: DifficultySystem) => {
  try {
    const response = await apiClient.post('/problems/switch-difficulty-system', {
      difficulty_system: system
    });
    return response.data;
  } catch (error) {
    console.error('切换难度系统失败:', error);
    throw error;
  }
}; 