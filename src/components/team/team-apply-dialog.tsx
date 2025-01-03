'use client'

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { sendTeamApply } from "@/lib/teamService"

const formSchema = z.object({
  message: z.string()
    .min(1, "申请理由不能为空")
    .max(500, "申请理由最多500个字符"),
})

interface TeamApplyDialogProps {
  teamId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TeamApplyDialog({
  teamId,
  open,
  onOpenChange,
  onSuccess,
}: TeamApplyDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await sendTeamApply(teamId, values.message)
      toast.success("申请已发送")
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error("发送申请失败")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>申请加入团队</DialogTitle>
          <DialogDescription>
            请填写申请理由，团队管理员会审核您的申请。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>申请理由</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入申请理由..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit">发送申请</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 