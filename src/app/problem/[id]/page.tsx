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

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { getProblemDetail } from "@/lib/problemService"
import type { ProblemDetail } from "@/lib/problemService"
import { SubmitDialog } from "@/components/submission/submit-dialog"
import { SubmissionList } from "@/components/submission/submission-list"

const difficultyMap = {
  easy: { label: "简单", color: "success" as const },
  medium: { label: "中等", color: "secondary" as const },
  hard: { label: "困难", color: "destructive" as const }
} as const

export default function ProblemDetailPage() {
  const params = useParams()
  const [problem, setProblem] = React.useState<ProblemDetail | null>(null)
  const [loading, setLoading] = React.useState(true)

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

  const MarkdownContent = ({ children }: { children: string }) => (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
      >
        {children}
      </Markdown>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
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
              <Badge variant={difficultyMap[problem.difficulty].color}>
                {difficultyMap[problem.difficulty].label}
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
    </div>
  )
} 