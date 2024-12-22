'use client'

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from "rehype-sanitize"

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createProblem } from "@/lib/problemService"

const formSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "题目描述不能为空"),
  input_description: z.string().min(1, "输入说明不能为空"),
  output_description: z.string().min(1, "输出说明不能为空"),
  samples: z.string().min(1, "样例数据不能为空").transform(value => {
    try {
      JSON.parse(value);
      return value;
    } catch {
      throw new Error("样例数据必须是有效的 JSON 格式");
    }
  }),
  hint: z.string().optional(),
  source: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  time_limit: z.number().min(100).max(10000),
  memory_limit: z.number().min(16).max(1024),
  is_public: z.boolean(),
  category_ids: z.array(z.number()),
  tag_ids: z.array(z.number())
})

type FormData = z.infer<typeof formSchema>

interface CreateProblemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateProblemDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateProblemDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      time_limit: 1000,
      memory_limit: 256,
      is_public: false,
      category_ids: [],
      tag_ids: [],
      description: '',
      input_description: '',
      output_description: '',
      hint: ''
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createProblem(data)
      toast.success("创建成功")
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error("创建失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建题目</DialogTitle>
          <DialogDescription>
            创建一个新的题目，填写题目的基本信息。支持 Markdown 格式。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>题目标题</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>题目描述</FormLabel>
                  <FormControl>
                    <div data-color-mode="light">
                      <MDEditor
                        value={field.value}
                        onChange={(value) => field.onChange(value || '')}
                        preview="edit"
                        previewOptions={{
                          rehypePlugins: [[rehypeSanitize]],
                        }}
                        height={200}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="input_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>输入说明</FormLabel>
                    <FormControl>
                      <div data-color-mode="light">
                        <MDEditor
                          value={field.value}
                          onChange={(value) => field.onChange(value || '')}
                          preview="edit"
                          previewOptions={{
                            rehypePlugins: [[rehypeSanitize]],
                          }}
                          height={150}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="output_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>输出说明</FormLabel>
                    <FormControl>
                      <div data-color-mode="light">
                        <MDEditor
                          value={field.value}
                          onChange={(value) => field.onChange(value || '')}
                          preview="edit"
                          previewOptions={{
                            rehypePlugins: [[rehypeSanitize]],
                          }}
                          height={150}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="samples"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>样例数据</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder={`[
  {
    "input": "1 2",
    "output": "3",
    "explanation": "1 + 2 = 3"
  }
]`} />
                  </FormControl>
                  <FormDescription>
                    请使用 JSON 格式输入样例数据，每个样例包含输入、输出和解释说明
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>难度</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择难度" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">简单</SelectItem>
                        <SelectItem value="medium">中等</SelectItem>
                        <SelectItem value="hard">困难</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>公开题目</FormLabel>
                      <FormDescription>
                        是否公开此题目
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>时间限制 (ms)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      范围：100-10000ms
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memory_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>内存限制 (MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      范围：16-1024MB
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>提示信息</FormLabel>
                  <FormControl>
                    <div data-color-mode="light">
                      <MDEditor
                        value={field.value}
                        onChange={(value) => field.onChange(value || '')}
                        preview="edit"
                        previewOptions={{
                          rehypePlugins: [[rehypeSanitize]],
                        }}
                        height={150}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>题目来源</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">创建题目</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 