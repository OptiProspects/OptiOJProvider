'use client'

import * as React from "react"
import { format } from "date-fns"
import { Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateAssignment } from "@/lib/teamService"
import type { TeamAssignment, TeamAssignmentProblem } from "@/lib/teamService"

interface AssignmentEditFormProps {
  teamId: number;
  assignment: TeamAssignment;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProblemFormData {
  id: string; // 临时ID，用于前端标识
  problem_id: number;
  problem_type: 'global' | 'team';
  team_problem_id?: number;
  order_index: number;
  score: number;
}

export function AssignmentEditForm({ teamId, assignment, onSuccess, onCancel }: AssignmentEditFormProps) {
  const [title, setTitle] = React.useState(assignment.title)
  const [description, setDescription] = React.useState(assignment.description)
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date(assignment.start_time))
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date(assignment.end_time))
  const [problems, setProblems] = React.useState<ProblemFormData[]>(
    assignment.problems?.map((p, index) => ({
      id: `existing-${index}`,
      problem_id: p.problem_id,
      problem_type: p.problem_type,
      team_problem_id: p.team_problem_id,
      order_index: p.order_index,
      score: p.score
    })) || []
  )
  const [submitting, setSubmitting] = React.useState(false)

  const handleAddProblem = () => {
    setProblems([
      ...problems,
      {
        id: `new-${Date.now()}`,
        problem_id: 0,
        problem_type: 'global',
        order_index: problems.length,
        score: 100
      }
    ])
  }

  const handleRemoveProblem = (id: string) => {
    setProblems(problems.filter(p => p.id !== id))
  }

  const handleProblemChange = (id: string, field: keyof ProblemFormData, value: any) => {
    setProblems(problems.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value }
      }
      return p
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) {
      toast.error("请输入作业标题")
      return
    }
    if (!startDate || !endDate) {
      toast.error("请选择开始时间和结束时间")
      return
    }
    if (startDate > endDate) {
      toast.error("开始时间不能晚于结束时间")
      return
    }
    if (problems.some(p => !p.problem_id)) {
      toast.error("请填写完整的题目信息")
      return
    }

    try {
      setSubmitting(true)
      await updateAssignment(assignment.id, {
        title,
        description,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        problems: problems.map(p => ({
          problem_id: p.problem_id,
          problem_type: p.problem_type,
          team_problem_id: p.team_problem_id,
          order_index: p.order_index,
          score: p.score
        }))
      })
      toast.success("更新作业成功")
      onSuccess()
    } catch (error) {
      toast.error("更新作业失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">作业标题</Label>
            <Input
              id="title"
              placeholder="请输入作业标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">作业描述</Label>
            <Textarea
              id="description"
              placeholder="请输入作业描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label>开始时间</Label>
            <DateTimePicker
              date={startDate}
              onDateChange={setStartDate}
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label>结束时间</Label>
            <DateTimePicker
              date={endDate}
              onDateChange={setEndDate}
              disabled={submitting}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>题目列表</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddProblem}
                disabled={submitting}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加题目
              </Button>
            </div>
            <div className="space-y-4">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                >
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>题目类型</Label>
                        <Select
                          value={problem.problem_type}
                          onValueChange={(value: 'global' | 'team') => 
                            handleProblemChange(problem.id, 'problem_type', value)
                          }
                          disabled={submitting}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">全局题目</SelectItem>
                            <SelectItem value="team">团队题目</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>
                          {problem.problem_type === 'global' ? '题目ID' : '团队题目ID'}
                        </Label>
                        <Input
                          type="number"
                          value={problem.problem_type === 'global' ? problem.problem_id : problem.team_problem_id || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            if (problem.problem_type === 'global') {
                              handleProblemChange(problem.id, 'problem_id', value)
                            } else {
                              handleProblemChange(problem.id, 'team_problem_id', value)
                              handleProblemChange(problem.id, 'problem_id', value)
                            }
                          }}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>顺序</Label>
                        <Input
                          type="number"
                          value={problem.order_index}
                          onChange={(e) => 
                            handleProblemChange(problem.id, 'order_index', parseInt(e.target.value) || 0)
                          }
                          disabled={submitting}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>分值</Label>
                        <Input
                          type="number"
                          value={problem.score}
                          onChange={(e) => 
                            handleProblemChange(problem.id, 'score', parseInt(e.target.value) || 0)
                          }
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveProblem(problem.id)}
                    disabled={submitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中
                </>
              ) : (
                "保存"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 