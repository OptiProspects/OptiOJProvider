'use client'

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from "rehype-sanitize"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeHighlight from "rehype-highlight"
import { Check, ChevronsUpDown} from "lucide-react"
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createProblem, updateProblem, type ProblemDetail} from "@/lib/problemService"
import { getTagList, type Tag } from "@/lib/tagService"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "题目描述不能为空"),
  input_description: z.string().min(1, "输入说明不能为空"),
  output_description: z.string().min(1, "输出说明不能为空"),
  sample_cases: z.string().min(1, "样例数据不能为空").transform(value => {
    try {
      JSON.parse(value);
      return value;
    } catch {
      throw new Error("样例数据必须是有效的 JSON 格式");
    }
  }),
  hint: z.string().optional(),
  source: z.string().optional(),
  difficulty: z.union([
    z.enum(["easy", "medium", "hard", "unrated"] as const),
    z.enum(["beginner", "basic", "basicplus", "advanced", "advplus", "provincial", "noi", "unrated"] as const)
  ]),
  time_limit: z.number().min(100).max(10000),
  memory_limit: z.number().min(16).max(1024),
  is_public: z.boolean(),
  category_ids: z.array(z.number()),
  tag_ids: z.array(z.number())
})

type FormData = z.infer<typeof formSchema>

interface ProblemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  problem?: ProblemDetail
}

const editorStyles = {
  wrapper: "!rounded-md !border !border-input !bg-background !shadow-sm",
  toolbar: "!border-b !border-input !bg-muted/50 !h-10",
  textarea: "!bg-background !text-foreground !min-h-[100px] !p-3 !text-sm",
  preview: "!bg-background !text-foreground !min-h-[100px] !p-3 !text-sm",
  editor: "wmde-markdown-var [--color-canvas-default:transparent] [--color-btn-bg:transparent] [--color-border-default:transparent]"
}

export function ProblemDialog({
  open,
  onOpenChange,
  onSuccess,
  problem
}: ProblemDialogProps) {
  const [tags, setTags] = React.useState<Tag[]>([])
  const [tagsOpen, setTagsOpen] = React.useState(false)

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
    },
    shouldUnregister: false
  })

  // 在编辑模式下预填充表单数据
  React.useEffect(() => {
    if (problem) {
      form.reset({
        title: problem.title,
        description: problem.description,
        input_description: problem.input_description,
        output_description: problem.output_description,
        sample_cases: problem.sample_cases,
        hint: problem.hint || '',
        source: problem.source || '',
        difficulty: problem.difficulty,
        time_limit: problem.time_limit,
        memory_limit: problem.memory_limit,
        is_public: problem.is_public,
        category_ids: problem.categories.map(c => c.id),
        tag_ids: problem.tags.map(t => t.id)
      })
    }
  }, [problem, form])

  const tagIds = useWatch({
    control: form.control,
    name: "tag_ids",
    defaultValue: []
  })

  const selectedTags = React.useMemo(() => {
    return tags.filter(tag => tagIds.includes(tag.id))
  }, [tagIds, tags])

  // 获取标签列表
  React.useEffect(() => {
    if (open) {
      getTagList({ page: 1, page_size: 100 })
        .then(response => {
          setTags(response.tags)
        })
        .catch(error => {
          toast.error("获取标签列表失败", {
            description: error.message || "请稍后重试"
          })
        })
    }
  }, [open])

  const onSubmit = async (data: FormData) => {
    try {
      if (problem) {
        await updateProblem(problem.id, data)
        toast.success("更新成功")
      } else {
        await createProblem(data)
        toast.success("创建成功")
      }
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(problem ? "更新失败" : "创建失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="h-[90vh]">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle>{problem ? "编辑题目" : "创建题目"}</DialogTitle>
              <DialogDescription>
                {problem ? "编辑题目信息" : "创建一个新的题目"}。支持 Markdown 格式。
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
                        <div data-color-mode="light" className={editorStyles.wrapper}>
                          <MDEditor
                            value={field.value}
                            onChange={(value) => field.onChange(value || '')}
                            preview="live"
                            previewOptions={{
                              remarkPlugins: [[remarkMath]],
                              rehypePlugins: [[rehypeSanitize], [rehypeKatex], [rehypeHighlight, { detect: true }]],
                            }}
                            height={200}
                            className={cn("!border-0", editorStyles.editor)}
                            visibleDragbar={false}
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
                          <div data-color-mode="light" className={editorStyles.wrapper}>
                            <MDEditor
                              value={field.value}
                              onChange={(value) => field.onChange(value || '')}
                              preview="live"
                              previewOptions={{
                                remarkPlugins: [[remarkMath]],
                                rehypePlugins: [[rehypeSanitize], [rehypeKatex], [rehypeHighlight, { detect: true }]],
                              }}
                              height={150}
                              className={cn("!border-0", editorStyles.editor)}
                              visibleDragbar={false}
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
                          <div data-color-mode="light" className={editorStyles.wrapper}>
                            <MDEditor
                              value={field.value}
                              onChange={(value) => field.onChange(value || '')}
                              preview="live"
                              previewOptions={{
                                remarkPlugins: [[remarkMath]],
                                rehypePlugins: [[rehypeSanitize], [rehypeKatex], [rehypeHighlight, { detect: true }]],
                              }}
                              height={150}
                              className={cn("!border-0", editorStyles.editor)}
                              visibleDragbar={false}
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
                  name="sample_cases"
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
                    name="tag_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>标签</FormLabel>
                        <FormControl>
                          <Popover 
                            open={tagsOpen} 
                            onOpenChange={setTagsOpen}
                            modal={true}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={tagsOpen}
                                className="w-full justify-between"
                              >
                                {selectedTags.length > 0 ? (
                                  <div className="flex gap-1 flex-wrap">
                                    {selectedTags.map(tag => (
                                      <Badge
                                        key={tag.id}
                                        style={{ backgroundColor: tag.color }}
                                        className="mr-1"
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  "选择标签"
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <div className="p-2">
                                <Input
                                  placeholder="搜索标签..."
                                  className="mb-2"
                                  onChange={(e) => {
                                    // TODO: 实现搜索功能
                                  }}
                                />
                                <ScrollArea className="h-[200px]">
                                  <div className="space-y-2">
                                    {tags.length === 0 ? (
                                      <div className="text-center py-4 text-muted-foreground">
                                        未找到标签
                                      </div>
                                    ) : (
                                      tags.map((tag) => {
                                        const isSelected = form.getValues("tag_ids")?.includes(tag.id)
                                        return (
                                          <div
                                            key={tag.id}
                                            className={cn(
                                              "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none cursor-pointer",
                                              "hover:bg-accent hover:text-accent-foreground",
                                              isSelected && "bg-accent"
                                            )}
                                            onClick={(e) => {
                                              e.preventDefault()
                                              e.stopPropagation()
                                              const value = form.getValues("tag_ids") || []
                                              const newValue = value.includes(tag.id)
                                                ? value.filter(id => id !== tag.id)
                                                : [...value, tag.id]
                                              form.setValue("tag_ids", newValue, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                                shouldValidate: true
                                              })
                                            }}
                                          >
                                            <div className="flex h-4 w-4 items-center justify-center">
                                              {isSelected && (
                                                <Check className="h-4 w-4" />
                                              )}
                                            </div>
                                            <Badge
                                              style={{ backgroundColor: tag.color }}
                                            >
                                              {tag.name}
                                            </Badge>
                                          </div>
                                        )
                                      })
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
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
                        <div data-color-mode="light" className={editorStyles.wrapper}>
                          <MDEditor
                            value={field.value}
                            onChange={(value) => field.onChange(value || '')}
                            preview="live"
                            previewOptions={{
                              remarkPlugins: [[remarkMath]],
                              rehypePlugins: [[rehypeSanitize], [rehypeKatex], [rehypeHighlight, { detect: true }]],
                            }}
                            height={150}
                            className={cn("!border-0", editorStyles.editor)}
                            visibleDragbar={false}
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 