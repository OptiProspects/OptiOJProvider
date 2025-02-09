'use client'

import * as React from "react"
import { Loader2, Search, Clock, HardDrive } from "lucide-react"
import { toast } from "sonner"
import debounce from "lodash/debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { updateAssignment, getAvailableProblems } from "@/lib/teamService"
import type { TeamAssignment, TeamAssignmentProblem, AvailableProblemInfo, ProblemTag } from "@/lib/teamService"

// 难度对应的颜色和文本
const difficultyConfig = {
  beginner: { label: "入门", color: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
  easy: { label: "简单", color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
  medium: { label: "中等", color: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
  hard: { label: "困难", color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
  expert: { label: "专家", color: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
} as const

interface AssignmentProblemDialogProps {
  teamId: number;
  assignment: TeamAssignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignmentProblemDialog({
  teamId,
  assignment,
  open,
  onOpenChange,
  onSuccess
}: AssignmentProblemDialogProps) {
  const [problemType, setProblemType] = React.useState<'all' | 'global' | 'team'>('all')
  const [keyword, setKeyword] = React.useState("")
  const [score, setScore] = React.useState("100")
  const [submitting, setSubmitting] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [problems, setProblems] = React.useState<AvailableProblemInfo[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [selectedProblem, setSelectedProblem] = React.useState<AvailableProblemInfo | null>(null)

  const fetchProblems = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAvailableProblems({
        team_id: teamId,
        page,
        page_size: 10,
        keyword,
        type: problemType
      })
      setProblems(data.problems || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error("获取题目列表失败:", error)
      toast.error("获取题目列表失败")
      setProblems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [teamId, page, keyword, problemType])

  React.useEffect(() => {
    if (open) {
      fetchProblems()
    } else {
      // 关闭对话框时重置状态
      setProblems([])
      setTotal(0)
      setPage(1)
      setKeyword("")
      setProblemType('all')
      setSelectedProblem(null)
      setScore("100")
    }
  }, [open, fetchProblems])

  const debouncedSearch = React.useMemo(
    () => debounce((value: string) => {
      setKeyword(value)
      setPage(1)
    }, 500),
    []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProblem) {
      toast.error("请选择题目")
      return
    }
    if (!score || parseInt(score) <= 0) {
      toast.error("请输入有效的分值")
      return
    }

    const existingProblems = assignment.problems || []
    const updatedProblems = [...existingProblems]
    updatedProblems.push({
      assignment_id: assignment.id,
      problem_id: selectedProblem.id,
      problem_type: selectedProblem.type,
      team_problem_id: selectedProblem.type === 'team' ? selectedProblem.team_problem_id : undefined,
      order_index: updatedProblems.length,
      score: parseInt(score)
    })

    try {
      setSubmitting(true)
      await updateAssignment(assignment.id, {
        problems: updatedProblems.map(p => ({
          problem_id: p.problem_id,
          problem_type: p.problem_type,
          team_problem_id: p.team_problem_id,
          order_index: p.order_index,
          score: p.score
        }))
      })
      toast.success("添加题目成功")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("添加题目失败:", error)
      toast.error("添加题目失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>添加题目</DialogTitle>
          <DialogDescription>
            搜索并添加一个新的题目到作业中
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索题目..."
                  className="pl-8"
                  onChange={(e) => debouncedSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Select
              value={problemType}
              onValueChange={(value: 'all' | 'global' | 'team') => {
                setProblemType(value)
                setPage(1)
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有题目</SelectItem>
                <SelectItem value="global">全局题目</SelectItem>
                <SelectItem value="team">团队题目</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead className="w-[100px]">难度</TableHead>
                    <TableHead className="w-[100px]">类型</TableHead>
                    <TableHead className="w-[180px]">限制</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : problems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {keyword ? "未找到匹配的题目" : "暂无题目"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    problems.map((problem) => (
                      <TableRow key={`${problem.type}-${problem.id}`}>
                        <TableCell>
                          {problem.type === 'global' ? problem.id : problem.team_problem_id}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{problem.title}</div>
                            {problem.type === 'global' && problem.tags && (
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
                        <TableCell>
                          {problem.type === 'global' ? '全局题目' : '团队题目'}
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
                        <TableCell>
                          <Button
                            variant={selectedProblem?.id === problem.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedProblem(problem)}
                          >
                            选择
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {selectedProblem && (
            <div className="grid gap-2">
              <Label>分值</Label>
              <Input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                disabled={submitting}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !selectedProblem}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                添加中
              </>
            ) : (
              "添加"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 