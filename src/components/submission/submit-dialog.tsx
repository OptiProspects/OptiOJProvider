import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitCode } from "@/lib/submissionService"

interface SubmitDialogProps {
  problemId: number
  trigger?: React.ReactNode
}

const LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
] as const

export function SubmitDialog({ problemId, trigger }: SubmitDialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [language, setLanguage] = React.useState<string>(LANGUAGES[0].value)
  const [code, setCode] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("请输入代码")
      return
    }

    try {
      setSubmitting(true)
      const response = await submitCode(problemId, language, code)
      if (response.code === 200) {
        toast.success(response.message || "提交成功")
        setOpen(false)
        router.push(`/submissions/${response.data.submission_id}`)
      } else {
        toast.error(response.message || "提交失败")
      }
    } catch (error) {
      toast.error("提交失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>提交代码</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>提交代码</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="选择编程语言" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="在此输入代码..."
            className="font-mono min-h-[400px]"
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "提交中..." : "提交"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 