'use client'

import * as React from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'
import Editor, { loader } from "@monaco-editor/react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronLeft, ChevronRight, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import Navbar from "@/components/Navbar"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { getProblemDetail, getCurrentDifficultySystem, type DifficultySystemResponse, type Difficulty } from "@/lib/problemService"
import type { ProblemDetail } from "@/lib/problemService"
import { SubmitDialog } from "@/components/submission/submit-dialog"
import { SubmissionList } from "@/components/submission/submission-list"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CodeEditor } from "@/components/code-editor"

// 配置 Monaco Editor 的 CDN 路径
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
})

const normalDifficultyMap = {
  easy: { label: "简单", color: "success" as const },
  medium: { label: "中等", color: "secondary" as const },
  hard: { label: "困难", color: "destructive" as const },
  unrated: { label: "暂无评级", color: "outline" as const }
} as const

const oiDifficultyMap = {
  beginner: { label: "入门/蒟蒻", color: "success" as const },
  basic: { label: "普及-", color: "success" as const },
  basicplus: { label: "普及/提高-", color: "secondary" as const },
  advanced: { label: "普及+/提高", color: "secondary" as const },
  advplus: { label: "提高+/省选-", color: "destructive" as const },
  provincial: { label: "省选/NOI-", color: "destructive" as const },
  noi: { label: "NOI/NOI+/CTSC", color: "destructive" as const },
  unrated: { label: "暂无评级", color: "outline" as const }
} as const

// 添加一个全局样式来隐藏 Monaco Editor 的滚动条
const monacoStyles = `
  .monaco-editor .scrollbar {
    background-color: hsl(var(--accent) / 0.1) !important;
  }
  .monaco-editor .slider {
    background-color: hsl(var(--accent)) !important;
    border-radius: 9999px !important;
  }
  .monaco-editor .slider:hover {
    background-color: hsl(var(--accent) / 0.8) !important;
  }
`

export default function ProblemDetailPage() {
  const params = useParams()
  const [problem, setProblem] = React.useState<ProblemDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [difficultySystem, setDifficultySystem] = React.useState<DifficultySystemResponse | null>(null)
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)

  React.useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await getProblemDetail(Number(params.id))
        setProblem(data)
      } catch (error) {
        console.error("Failed to fetch problem:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProblem()
  }, [params.id])

  React.useEffect(() => {
    getCurrentDifficultySystem()
      .then(system => {
        setDifficultySystem(system)
      })
      .catch(error => {
        console.error("获取难度系统失败:", error)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">题目不存在</h1>
          <p className="text-muted-foreground mt-2">该题目可能已被删除或您没有访问权限</p>
        </div>
      </div>
    )
  }

  const getDifficultyLabel = (difficulty: Difficulty) => {
    if (!difficultySystem) return { label: difficulty, color: "outline" as const }
    
    const currentSystemInfo = difficultySystem.systems.find(
      sys => sys.system === problem.difficulty_system
    )
    if (!currentSystemInfo) return { label: difficulty, color: "outline" as const }

    const difficultyInfo = currentSystemInfo.difficulties.find(
      diff => diff.code === difficulty
    )
    if (!difficultyInfo) return { label: difficulty, color: "outline" as const }

    const isOiSystem = problem.difficulty_system === "oi"
    const map = isOiSystem ? oiDifficultyMap : normalDifficultyMap
    return map[difficulty as keyof typeof map] || { label: difficultyInfo.display, color: "outline" as const }
  }

  const difficultyInfo = getDifficultyLabel(problem.difficulty)

  const MarkdownContent = ({ children }: { children: string }) => (
    <div className="prose dark:prose-invert max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
      >
        {children}
      </Markdown>
    </div>
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 flex relative overflow-hidden">
        <div className={cn(
          "flex-1 transition-all duration-300 ease-in-out transform",
          isEditorOpen ? "mr-[800px]" : "mr-0"
        )}>
          <ScrollArea className="h-full">
            <div className="container max-w-screen-xl mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">
                      {problem.id}. {problem.title}
                    </h1>
                    <SubmitDialog problemId={problem.id} />
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant={difficultyInfo.color}>
                      {difficultyInfo.label}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      时间限制: {problem.time_limit}ms
                    </div>
                    <div className="text-sm text-muted-foreground">
                      内存限制: {problem.memory_limit}MB
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {problem.categories.map((category) => (
                      <Badge key={category.id} variant="outline">
                        {category.name}
                      </Badge>
                    ))}
                    {problem.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        style={{
                          backgroundColor: tag.color,
                          color: '#fff'
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <Tabs defaultValue="description" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="description">题目描述</TabsTrigger>
                    <TabsTrigger value="solution">题解</TabsTrigger>
                    <TabsTrigger value="submissions">提交记录</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="space-y-8">
                    <MarkdownContent>{problem.description}</MarkdownContent>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">输入格式</h3>
                      <MarkdownContent>{problem.input_description}</MarkdownContent>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">输出格式</h3>
                      <MarkdownContent>{problem.output_description}</MarkdownContent>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">样例</h3>
                      {JSON.parse(problem.samples).map((sample: { input: string; output: string }, index: number) => (
                        <div key={index} className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="font-medium">输入 #{index + 1}</div>
                            <pre className="p-4 rounded-lg bg-muted font-mono text-sm">
                              {sample.input}
                            </pre>
                          </div>
                          <div className="space-y-2">
                            <div className="font-medium">输出 #{index + 1}</div>
                            <pre className="p-4 rounded-lg bg-muted font-mono text-sm">
                              {sample.output}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>

                    {problem.hint && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">提示</h3>
                        <MarkdownContent>{problem.hint}</MarkdownContent>
                      </div>
                    )}

                    {problem.source && (
                      <div className="text-sm text-muted-foreground">
                        来源：{problem.source}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="solution">
                    题解功能开发中...
                  </TabsContent>

                  <TabsContent value="submissions">
                    <SubmissionList problemId={problem.id} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <ScrollBar orientation="vertical" className="z-50" />
          </ScrollArea>
        </div>

        <CodeEditor isOpen={isEditorOpen} onOpenChange={setIsEditorOpen} problem={problem} />

        <button
          onClick={() => setIsEditorOpen(!isEditorOpen)}
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-24 bg-background hover:bg-accent border-l border-y text-foreground rounded-l-md shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out z-50"
          style={{
            right: isEditorOpen ? "800px" : "0"
          }}
        >
          {isEditorOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </main>
    </div>
  )
} 