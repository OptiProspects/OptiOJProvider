'use client'

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
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
import { getAssignmentDetail, getTeamDetail, updateAssignment } from "@/lib/teamService"
import type { TeamAssignment, TeamDetail } from "@/lib/teamService"
import { AssignmentProblemDialog } from "@/components/team/assignment-problem-dialog"
import Navbar from "@/components/Navbar"

export default function AssignmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [assignment, setAssignment] = React.useState<TeamAssignment | null>(null)
  const [team, setTeam] = React.useState<TeamDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
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

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteProblem = async () => {
    if (deletingProblemIndex === null || !assignment) return

    const problems = [...(assignment.problems || [])]
    problems.splice(deletingProblemIndex, 1)
    // 更新顺序
    problems.forEach((p, index) => {
      p.order_index = index
    })

    try {
      await updateAssignment(assignment.id, {
        problems: problems.map(p => ({
          problem_id: p.problem_id,
          problem_type: p.problem_type,
          team_problem_id: p.team_problem_id,
          order_index: p.order_index,
          score: p.score
        }))
      })
      toast.success("删除题目成功")
      fetchData()
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
              {assignment.problems && assignment.problems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>序号</TableHead>
                      <TableHead>题目类型</TableHead>
                      <TableHead>题目ID</TableHead>
                      <TableHead>分值</TableHead>
                      {isAdmin && <TableHead className="w-[100px]">操作</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignment.problems.map((problem, index) => (
                      <TableRow key={`${problem.problem_type}-${problem.problem_id}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {problem.problem_type === 'global' ? '全局题目' : '团队题目'}
                        </TableCell>
                        <TableCell>
                          {problem.problem_type === 'global' ? problem.problem_id : problem.team_problem_id}
                        </TableCell>
                        <TableCell>{problem.score}</TableCell>
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
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">暂无题目</p>
                </div>
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
              onSuccess={fetchData}
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