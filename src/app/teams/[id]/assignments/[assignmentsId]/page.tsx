'use client'

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Pencil, Trash2, Clock, HardDrive, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getAssignmentDetail,
  getTeamDetail,
  updateAssignment,
  getAssignmentProblems
} from "@/lib/teamService"
import type {
  TeamAssignment,
  TeamDetail,
  AssignmentProblemDetail,
  ProblemTag
} from "@/lib/teamService"
import { AssignmentProblemDialog } from "@/components/team/assignment-problem-dialog"
import Navbar from "@/components/Navbar"

// 难度对应的颜色和文本
const difficultyConfig = {
  beginner: { label: "入门", color: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
  easy: { label: "简单", color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
  medium: { label: "中等", color: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
  hard: { label: "困难", color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
  expert: { label: "专家", color: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
  team: { label: "团队题目", color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20" },
} as const

export default function AssignmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [assignment, setAssignment] = React.useState<TeamAssignment | null>(null)
  const [team, setTeam] = React.useState<TeamDetail | null>(null)
  const [problems, setProblems] = React.useState<AssignmentProblemDetail[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadingProblems, setLoadingProblems] = React.useState(false)
  const [showAddProblemDialog, setShowAddProblemDialog] = React.useState(false)
  const [deletingProblemIndex, setDeletingProblemIndex] = React.useState<number | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [assignmentData, teamData] = await Promise.all([
        getAssignmentDetail(Number(params.assignmentsId)),
        getTeamDetail(Number(params.id))
      ])
      setAssignment(assignmentData)
      setTeam(teamData)
    } catch (error) {
      console.error("获取作业详情失败:", error)
      toast.error("获取作业详情失败")
    } finally {
      setLoading(false)
    }
  }, [params.assignmentsId, params.id])

  const fetchProblems = React.useCallback(async () => {
    if (!assignment || !team) return
    try {
      setLoadingProblems(true)
      const data = await getAssignmentProblems({
        assignment_id: assignment.id,
        team_id: team.id
      })
      setProblems(data.problems)
    } catch (error) {
      console.error("获取题目列表失败:", error)
      toast.error("获取题目列表失败")
    } finally {
      setLoadingProblems(false)
    }
  }, [assignment, team])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  React.useEffect(() => {
    if (assignment && team) {
      fetchProblems()
    }
  }, [assignment, team, fetchProblems])

  const handleDeleteProblem = async () => {
    if (deletingProblemIndex === null || !assignment || !problems[deletingProblemIndex]) return

    const updatedProblems = problems.filter((_, index) => index !== deletingProblemIndex)
    // 更新顺序
    updatedProblems.forEach((p, index) => {
      p.order_index = index
    })

    try {
      await updateAssignment(assignment.id, {
        problems: updatedProblems.map(p => ({
          problem_id: p.id,
          problem_type: p.type,
          team_problem_id: p.team_problem_id,
          order_index: p.order_index,
          score: p.score
        }))
      })
      toast.success("删除题目成功")
      fetchProblems()
    } catch (error) {
      toast.error("删除题目失败")
    } finally {
      setDeletingProblemIndex(null)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
          <Spinner className="h-8 w-8" />
        </div>
      </>
    )
  }

  if (!assignment || !team) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold">作业不存在</h1>
            <p className="text-muted-foreground mt-2">
              该作业可能已被删除或您没有访问权限
            </p>
          </div>
        </div>
      </>
    )
  }

  const isAdmin = team.user_role === "owner" || team.user_role === "admin"

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-7xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/teams/${params.id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{assignment.title}</h1>
            <p className="text-muted-foreground mt-1">{team.name}</p>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => router.push(`/teams/${params.id}/assignments/${params.assignmentsId}/edit`)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              编辑作业
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>作业信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">作业描述</h3>
                <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                  {assignment.description || "暂无描述"}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <h3 className="font-medium">开始时间</h3>
                  <p className="text-muted-foreground mt-1">
                    {format(new Date(assignment.start_time), "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">结束时间</h3>
                  <p className="text-muted-foreground mt-1">
                    {format(new Date(assignment.end_time), "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>题目列表</CardTitle>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddProblemDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加题目
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loadingProblems ? (
                <div className="py-8 text-center">
                  <Spinner className="h-8 w-8 mx-auto" />
                </div>
              ) : problems.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">暂无题目</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>序号</TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead>难度</TableHead>
                      <TableHead>分值</TableHead>
                      <TableHead>提交情况</TableHead>
                      <TableHead>限制</TableHead>
                      {isAdmin && <TableHead className="w-[100px]">操作</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problems.map((problem, index) => (
                      <TableRow key={`${problem.type}-${problem.id}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Link
                              href={`/teams/${params.id}/assignments/${params.assignmentsId}/problems/${problem.id}`}
                              className="font-medium hover:underline"
                            >
                              {problem.title}
                            </Link>
                            {problem.type === 'global' && (
                              <div className="flex flex-wrap gap-1">
                                {JSON.parse(problem.tags).map((tag: ProblemTag) => (
                                  <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="max-w-[120px] truncate"
                                    style={{
                                      backgroundColor: `${tag.color}20`,
                                      color: tag.color,
                                    }}
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={difficultyConfig[problem.difficulty].color}
                          >
                            {difficultyConfig[problem.difficulty].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{problem.score}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>总提交：{problem.submission_stats.total_count}</span>
                            </div>
                            {problem.submission_stats.total_count > 0 && (
                              <div className="text-sm text-muted-foreground">
                                通过率：{(problem.submission_stats.accepted_rate * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{problem.time_limit}ms</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <HardDrive className="h-3.5 w-3.5" />
                              <span>{problem.memory_limit}MB</span>
                            </div>
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingProblemIndex(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
          <>
            <AssignmentProblemDialog
              teamId={team.id}
              assignment={assignment}
              open={showAddProblemDialog}
              onOpenChange={setShowAddProblemDialog}
              onSuccess={fetchProblems}
            />

            <AlertDialog
              open={deletingProblemIndex !== null}
              onOpenChange={(open) => !open && setDeletingProblemIndex(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除题目</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除这个题目吗？此操作无法撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProblem}>
                    确认删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </>
  )
}
