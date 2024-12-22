'use client'

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { getSubmissionDetail } from "@/lib/submissionService"
import type { SubmissionStatus } from "@/lib/submissionService"

interface TestResult {
  id: number
  submission_id: number
  test_case_id: number
  status: string
  time_used: number
  memory_used: number
  error_message: string | null
  created_at: string
}

interface SubmissionDetail {
  id: number
  problem_id: number
  user_id: number
  language: string
  status: SubmissionStatus
  time_used: number
  memory_used: number
  code: string
  error_message: string | null
  created_at: string
  results: TestResult[]
}

const statusMap: Record<SubmissionStatus, { label: string; color: string }> = {
  Pending: { label: "Pending", color: "bg-gray-500" },
  Running: { label: "Running", color: "bg-blue-500" },
  Accepted: { label: "Accepted", color: "bg-green-500" },
  "Wrong Answer": { label: "Wrong Answer", color: "bg-red-500" },
  "Time Limit Exceeded": { label: "Time Limit Exceeded", color: "bg-yellow-500" },
  "Memory Limit Exceeded": { label: "Memory Limit Exceeded", color: "bg-yellow-500" },
  "Compilation Error": { label: "Compilation Error", color: "bg-orange-500" },
  "Runtime Error": { label: "Runtime Error", color: "bg-red-500" },
  "System Error": { label: "System Error", color: "bg-red-500" },
}

const getStatusInfo = (status: string) => {
  if (!status) return { label: "Unknown", color: "bg-gray-500" }
  const normalizedStatus = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') as SubmissionStatus
  return statusMap[normalizedStatus] || { label: status, color: "bg-gray-500" }
}

export default function SubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [submission, setSubmission] = React.useState<SubmissionDetail | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await getSubmissionDetail(Number(params.id))
        if (response.code === 200) {
          setSubmission(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch submission:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">提交记录不存在</h1>
          <p className="text-muted-foreground mt-2">
            该提交记录可能已被删除或您没有访问权限
          </p>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(submission.status)

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">提交详情</h1>
              <p className="text-sm text-muted-foreground">
                提交ID: {submission.id}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/problem/${submission.problem_id}`}>
                返回题目
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">状态</div>
              <Badge className={`${statusInfo.color} text-white`}>
                {statusInfo.label}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">提交时间</div>
              <div>
                {format(
                  new Date(submission.created_at),
                  "yyyy-MM-dd HH:mm:ss"
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">执行时间</div>
              <div>{submission.time_used}ms</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">内存使用</div>
              <div>{submission.memory_used}KB</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">编程语言</div>
              <div>{submission.language.toUpperCase()}</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">源代码</h2>
            <div className="rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={submission.language.toLowerCase()}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                }}
                showLineNumbers
              >
                {submission.code}
              </SyntaxHighlighter>
            </div>
          </div>

          {submission.error_message && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">错误信息</h2>
              <pre className="p-4 rounded-lg bg-destructive/10 text-destructive font-mono text-sm overflow-x-auto">
                {submission.error_message}
              </pre>
            </div>
          )}

          {submission.results && submission.results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">测试点结果</h2>
              <div className="grid gap-4">
                {submission.results.map((result, index) => {
                  const statusInfo = getStatusInfo(result.status)
                  return (
                    <div
                      key={result.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">测试点 #{index + 1}</div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>执行时间: {result.time_used}ms</span>
                            <span>内存使用: {result.memory_used}KB</span>
                          </div>
                        </div>
                        <Badge className={`${statusInfo.color} text-white`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      {result.error_message && (
                        <div className="mt-2">
                          <pre className="p-2 rounded bg-destructive/10 text-destructive font-mono text-xs">
                            {result.error_message}
                          </pre>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 