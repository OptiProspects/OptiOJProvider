'use client';

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createAssignment } from "@/lib/teamService"

interface CreateAssignmentDialogProps {
  teamId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAssignmentDialog({
  teamId,
  open,
  onOpenChange,
  onSuccess
}: CreateAssignmentDialogProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [startDate, setStartDate] = React.useState<Date>()
  const [endDate, setEndDate] = React.useState<Date>()
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = async () => {
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
      onOpenChange(false)
      onSuccess?.()
      // 重置表单
      setTitle("")
      setDescription("")
      setStartDate(undefined)
      setEndDate(undefined)
    } catch {
      toast.error("创建作业失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建作业</DialogTitle>
          <DialogDescription>
            创建一个新的团队作业，稍后可以在作业详情页面中添加题目。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              作业标题
            </label>
            <Input
              id="title"
              placeholder="请输入作业标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              开始时间
            </label>
            <DateTimePicker
              date={startDate}
              onDateChange={setStartDate}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              结束时间
            </label>
            <DateTimePicker
              date={endDate}
              onDateChange={setEndDate}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                创建中
              </>
            ) : (
              "创建"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 