import apiClient from '@/config/apiConfig'

export interface SubmissionRecord {
  id: number
  problem_id: number
  user_id: number
  language: string
  status: SubmissionStatus
  time_used: number
  memory_used: number
  created_at: string
}

export interface SubmissionDetail extends SubmissionRecord {
  source_code: string
  error_message: string
}

export type SubmissionStatus =
  | "Pending"
  | "Running"
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Memory Limit Exceeded"
  | "Compilation Error"
  | "Runtime Error"
  | "System Error"

export interface SubmissionListResponse {
  submissions: SubmissionRecord[]
  total: number
  page: number
  page_size: number
}

export async function submitCode(problemId: number, language: string, sourceCode: string) {
  const response = await apiClient.post('/submissions', {
    problem_id: problemId,
    language,
    code: sourceCode,
  })

  return response.data
}

export async function getSubmissionList(
  page: number,
  pageSize: number,
  problemId?: number
) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  })

  if (problemId) {
    params.append("problem_id", problemId.toString())
  }

  const response = await apiClient.get(`/submissions?${params.toString()}`)
  return response.data
}

export async function getSubmissionDetail(submissionId: number) {
  const response = await apiClient.get(`/submissions/${submissionId}`)
  return response.data
} 