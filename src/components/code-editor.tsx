'use client'

import * as React from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { debugCode, DebugResult } from '@/lib/debugService'
import { submitCode } from '@/lib/submissionService'
import { EditorToolbar } from "./code-editor/editor-toolbar"
import { EditorSettings } from "./code-editor/editor-settings"
import { MonacoEditor } from "./code-editor/monaco-editor"
import { DebugPanel } from "./code-editor/debug-panel"
import { EditorFooter } from "./code-editor/editor-footer"
import { cn } from "@/lib/utils"

interface CodeEditorProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  problem?: {
    id: number
    sample_cases: string
    title: string
  }
}

export function CodeEditor({ isOpen, onOpenChange, problem }: CodeEditorProps) {
  const [code, setCode] = React.useState("")
  const [input, setInput] = React.useState("")
  const [isDebugOpen, setIsDebugOpen] = React.useState(false)
  const [isDebugging, setIsDebugging] = React.useState(false)
  const [debugResult, setDebugResult] = React.useState<DebugResult | null>(null)
  const editorRef = React.useRef<any>(null)
  const { theme } = useTheme()
  const [editorTheme, setEditorTheme] = React.useState(theme === 'dark' ? 'github-dark' : 'github')
  const [fontSize, setFontSize] = React.useState(14)
  const [tabSize, setTabSize] = React.useState(4)
  const [language, setLanguage] = React.useState("cpp")
  const [samples, setSamples] = React.useState<Array<{ input: string, output: string, explanation?: string }>>([])
  const [expectedOutput, setExpectedOutput] = React.useState<string>("")
  const [activeTab, setActiveTab] = React.useState("input")
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    console.log('problem?.sample_cases:', problem?.sample_cases)
    if (problem?.sample_cases) {
      try {
        let parsedSamples = []
        if (typeof problem.sample_cases === 'string') {
          console.log('Parsing string sample_cases:', problem.sample_cases)
          parsedSamples = JSON.parse(problem.sample_cases)
        } else if (Array.isArray(problem.sample_cases)) {
          console.log('Using array sample_cases:', problem.sample_cases)
          parsedSamples = problem.sample_cases
        }
        console.log('Final parsedSamples:', parsedSamples)
        setSamples(parsedSamples || [])
      } catch (error) {
        console.error('解析测试样例失败:', error)
        setSamples([])
      }
    } else {
      console.log('No sample_cases found')
      setSamples([])
    }
  }, [problem?.sample_cases])

  const handleFillSample = (index: number) => {
    console.log('点击样例按钮:', index)
    console.log('当前样例列表:', samples)
    const sample = samples[index]
    if (sample) {
      console.log('选中的样例:', sample)
      setInput(sample.input)
      setExpectedOutput(sample.output)
    }
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
  }

  React.useEffect(() => {
    setEditorTheme(theme === 'dark' ? 'github-dark' : 'github')
  }, [theme])

  const handleDebug = async () => {
    try {
      setIsDebugging(true)
      const result = await debugCode({
        language,
        code,
        input,
        expected_output: expectedOutput,
        time_limit: 1000,
        memory_limit: 256
      })
      setDebugResult(result)
      setActiveTab("output")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '调试失败')
    } finally {
      setIsDebugging(false)
    }
  }

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("请输入代码")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await submitCode(problem?.id || 0, language, code)
      if (response.code === 200) {
        toast.success(response.message || "提交成功")
        router.push(`/submissions/${response.data.submission_id}`)
      } else {
        toast.error(response.message || "提交失败")
      }
    } catch (error) {
      toast.error("提交失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full bg-background border-l">
      <div className="h-full flex flex-col">
        <EditorToolbar
          language={language}
          onLanguageChange={setLanguage}
          onClearCode={() => setCode("")}
        >
          <EditorSettings
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            tabSize={tabSize}
            onTabSizeChange={setTabSize}
            editorTheme={editorTheme}
            onThemeChange={setEditorTheme}
            currentTheme={theme as 'light' | 'dark'}
          />
        </EditorToolbar>
        
        <div className="flex-1 relative min-h-0 flex flex-col">
          <div className="absolute inset-0">
            <MonacoEditor
              code={code}
              onChange={(value) => setCode(value || "")}
              language={language}
              theme={editorTheme}
              fontSize={fontSize}
              tabSize={tabSize}
              onMount={handleEditorDidMount}
            />
          </div>
        </div>

        <div className="flex flex-col bg-background">
          <div className={cn(
            "overflow-hidden transition-[height] duration-300 ease-in-out",
            isDebugOpen ? "h-[400px] border-t" : "h-0"
          )}>
            <div className={cn(
              "h-[400px] bg-background z-20 relative transition-opacity duration-300",
              isDebugOpen ? "opacity-100" : "opacity-0"
            )}>
              {samples && Array.isArray(samples) ? (
                <DebugPanel
                  input={input}
                  onInputChange={setInput}
                  samples={samples}
                  onSampleSelect={handleFillSample}
                  isDebugging={isDebugging}
                  onDebug={handleDebug}
                  debugResult={debugResult}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              ) : null}
            </div>
          </div>
          
          <EditorFooter
            isDebugOpen={isDebugOpen}
            onDebugOpenChange={setIsDebugOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
