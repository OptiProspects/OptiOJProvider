'use client'

import * as React from "react"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Card, CardContent } from "@/components/ui/card"
import { createAssignment } from "@/lib/teamService"
import type { CreateAssignmentRequest } from "@/lib/teamService"

interface AssignmentFormProps {
  teamId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AssignmentForm({ teamId, onSuccess, onCancel }: AssignmentFormProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [startDate, setStartDate] = React.useState<Date>()
  const [endDate, setEndDate] = React.useState<Date>()
  const [submitting, setSubmitting] = React.useState(false)

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

    try {
      setSubmitting(true)
      await createAssignment({
        team_id: teamId,
        title,
        description,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        problems: [] // 暂时为空，后续在作业详情页面中添加题目
      })
      toast.success("创建作业成功")
      onSuccess()
    } catch (error) {
      toast.error("创建作业失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              作业标题
            </label>
            <Input
              id="title"
              placeholder="请输入作业标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              作业描述
            </label>
            <Textarea
              id="description"
              placeholder="请输入作业描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              开始时间
            </label>
            <DateTimePicker
              date={startDate}
              onDateChange={setStartDate}
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              结束时间
            </label>
            <DateTimePicker
              date={endDate}
              onDateChange={setEndDate}
              disabled={submitting}
            />
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
                  创建中
                </>
              ) : (
                "创建"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 