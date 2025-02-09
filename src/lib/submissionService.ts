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

export interface TeamAssignmentSubmissionRecord extends SubmissionRecord {
  problem_type: 'global' | 'team'
  problem_title: string
  username: string
  nickname: string
  score: number
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

export interface TeamAssignmentSubmissionListResponse {
  submissions: TeamAssignmentSubmissionRecord[]
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

export async function getTeamAssignmentSubmissionList(params: {
  page: number
  page_size: number
  team_id: number
  assignment_id: number
  problem_id?: number
  user_id?: number
  status?: SubmissionStatus
  order_type?: 'asc' | 'desc'
}) {
  const response = await apiClient.get<{
    code: number
    data: TeamAssignmentSubmissionListResponse
  }>('/teams/assignments/getSubmissions', { params })
  return response.data.data
}

export async function getSubmissionDetail(submissionId: number) {
  const response = await apiClient.get(`/submissions/${submissionId}`)
  return response.data
} 