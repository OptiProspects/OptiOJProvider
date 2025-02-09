'use client'

import * as React from "react"
import { useParams } from "next/navigation"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'
import { loader } from "@monaco-editor/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Navbar from "@/components/Navbar"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { getCurrentDifficultySystem, type DifficultySystemResponse, type Difficulty } from "@/lib/problemService"
import { getAssignmentProblemDetail, type AssignmentProblemFullDetail } from "@/lib/teamService"
import { SubmissionList } from "@/components/submission/submission-list"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CodeEditor } from "@/components/code-editor"
import { normalDifficultyMap, oiDifficultyMap } from "@/lib/difficulty"

// 配置 Monaco Editor 的 CDN 路径
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
})

export default function ProblemDetailPage() {
  const params = useParams()
  const [problem, setProblem] = React.useState<AssignmentProblemFullDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [difficultySystem, setDifficultySystem] = React.useState<DifficultySystemResponse | null>(null)
  const [isEditorOpen, setIsEditorOpen] = React.useState(true)
  const [editorWidth, setEditorWidth] = React.useState(800)
  const [isResizing, setIsResizing] = React.useState(false)
  const [editorWidthRatio, setEditorWidthRatio] = React.useState(0.4) // 默认40%

  React.useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await getAssignmentProblemDetail({
          team_id: Number(params.id),
          assignment_id: Number(params.assignmentsId),
          problem_id: Number(params.problemId),
          problem_type: 'global' // 这里可能需要根据实际情况动态设置
        })
        setProblem(data)
      } catch (error) {
        console.error("获取题目失败:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProblem()
  }, [params.id, params.assignmentsId, params.problemId])

  React.useEffect(() => {
    getCurrentDifficultySystem()
      .then(system => {
        setDifficultySystem(system)
      })
      .catch(error => {
        console.error("获取难度系统失败:", error)
      })
  }, [])

  // 修改屏幕宽度监听
  React.useEffect(() => {
    const handleResize = () => {
      // 在小屏幕上自动关闭编辑器
      if (window.innerWidth < 768) {
        setIsEditorOpen(false)
      }
      // 根据保存的比例调整编辑器宽度
      setEditorWidth(Math.min(800, window.innerWidth * editorWidthRatio))
    }

    // 初始化
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [editorWidthRatio]) // 添加editorWidthRatio作为依赖

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true)
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }

  const handleResizeMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing) return
    const minWidth = Math.min(400, window.innerWidth * 0.3)
    const maxWidth = window.innerWidth * 0.7
    const newWidth = window.innerWidth - e.clientX
    const clampedWidth = Math.min(Math.max(minWidth, newWidth), maxWidth)
    
    // 保存新的宽度比例
    const newRatio = clampedWidth / window.innerWidth
    setEditorWidthRatio(newRatio)
    setEditorWidth(clampedWidth)
  }, [isResizing])

  const handleResizeEnd = React.useCallback(() => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }, [handleResizeMove])

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [handleResizeMove, handleResizeEnd])

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
      sys => sys.system === (problem.difficulty_system || 'normal')
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

  const difficultyInfo = getDifficultyLabel(problem.difficulty as Difficulty)

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
        {/* 左侧题目区域 */}
        <div 
          className={cn(
            "h-full transition-[width] duration-300 ease-in-out",
            isEditorOpen ? "w-[60%] lg:w-[65%]" : "w-full"
          )}
          style={{ 
            width: isEditorOpen ? `calc(100% - ${editorWidth}px)` : '100%'
          }}
        >
          <ScrollArea className="h-full">
            <div className="w-full px-4 py-8">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">
                      {problem.id}. {problem.title}
                    </h1>
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
                    {(() => {
                      try {
                        const tags = typeof problem.tags === 'string' 
                          ? JSON.parse(problem.tags) 
                          : Array.isArray(problem.tags) 
                            ? problem.tags 
                            : []
                        
                        return tags.map((tag: { id: number, name: string, color: string }) => (
                          <Badge
                            key={tag.id}
                            style={{
                              backgroundColor: tag.color,
                              color: '#fff'
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))
                      } catch (error) {
                        console.error('解析标签失败:', error)
                        return null
                      }
                    })()}
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
                      {problem.sample_cases && problem.sample_cases !== "" ? 
                        JSON.parse(problem.sample_cases).map((sample: { input: string; output: string }, index: number) => (
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
                        ))
                      : (
                        <div className="text-muted-foreground">暂无样例</div>
                      )}
                    </div>

                    {problem.hint && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">提示</h3>
                        <MarkdownContent>{problem.hint}</MarkdownContent>
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
            <ScrollBar orientation="vertical" className="z-10" />
          </ScrollArea>
        </div>

        {/* 编辑器切换按钮 */}
        <button
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-10",
            "w-6 h-24 bg-accent hover:bg-accent/90",
            "flex items-center justify-center",
            "rounded-l border-l border-y",
            isEditorOpen ? "right-[400px]" : "right-0",
            "transition-all duration-300 ease-in-out"
          )}
          style={{ 
            right: isEditorOpen ? `${editorWidth}px` : 0 
          }}
          onClick={() => setIsEditorOpen(!isEditorOpen)}
        >
          {isEditorOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* 编辑器区域 */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full bg-background",
            "transition-transform duration-300 ease-in-out",
            isEditorOpen ? "translate-x-0" : "translate-x-full"
          )}
          style={{ width: `${editorWidth}px` }}
        >
          {/* 拖拽条 */}
          <div
            className={cn(
              "absolute -left-2 top-0 w-4 h-full",
              "cursor-col-resize select-none",
              "flex items-center justify-center",
              "group",
              isResizing && "active"
            )}
            onMouseDown={handleResizeStart}
          >
            <div className={cn(
              "w-[2px] h-full",
              "bg-border group-hover:bg-primary/50 group-active:bg-primary",
              "group-hover:w-1 transition-[width,background-color]",
              isResizing && "w-1 bg-primary"
            )} />
          </div>

          <CodeEditor
            isOpen={isEditorOpen}
            onOpenChange={setIsEditorOpen}
            problem={problem}
          />
        </div>
      </main>
    </div>
  )
}
