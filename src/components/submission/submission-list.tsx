import * as React from "react"
import { format } from "date-fns"
import Link from "next/link"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { getSubmissionList } from "@/lib/submissionService"
import type { SubmissionStatus } from "@/lib/submissionService"

interface SubmissionListProps {
  problemId?: number
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
  return statusMap[status as SubmissionStatus] || { label: status, color: "bg-gray-500" }
}

export function SubmissionList({ problemId }: SubmissionListProps) {
  const [page, setPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [submissions, setSubmissions] = React.useState<any[]>([])
  const [total, setTotal] = React.useState(0)
  const pageSize = 20

  const fetchSubmissions = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await getSubmissionList(page, pageSize, problemId)
      setSubmissions(response.data.submissions)
      setTotal(response.data.total)
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
    } finally {
      setLoading(false)
    }
  }, [page, problemId])

  React.useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>提交ID</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>执行时间</TableHead>
            <TableHead>内存使用</TableHead>
            <TableHead>语言</TableHead>
            <TableHead>提交时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => {
            const statusInfo = getStatusInfo(submission.status)
            return (
              <TableRow key={submission.id}>
                <TableCell>{submission.id}</TableCell>
                <TableCell>
                  <Badge className={`${statusInfo.color} text-white`}>
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>{submission.time_used}ms</TableCell>
                <TableCell>{submission.memory_used}KB</TableCell>
                <TableCell>{submission.language.toUpperCase()}</TableCell>
                <TableCell>
                  {format(new Date(submission.created_at), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/submissions/${submission.id}`}>查看详情</Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {page !== 1 ? (
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
              ) : (
                <PaginationPrevious className="pointer-events-none opacity-50" />
              )}
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink onClick={() => setPage(p)} isActive={page === p}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              {page !== totalPages ? (
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              ) : (
                <PaginationNext className="pointer-events-none opacity-50" />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
} 