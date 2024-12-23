'use client'

import * as React from "react"
import { Settings, Trash2, Play, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import Editor, { loader } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"
import { debugCode, DebugResult } from '@/lib/debugService'

// 配置 Monaco Editor 的 CDN 路径
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
  },
  'vs/nls': {
    availableLanguages: {
      '*': ''
    }
  }
})

// 确保加载语言支持
loader.init().then(() => {
  // 语言支持已加载
})

// 添加一个全局样式来自定义 Monaco Editor 的滚动条
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

interface CodeEditorProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const languages = [
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
]

const themes = {
  light: [
    { value: 'github', label: 'GitHub (默认)' },
    { value: 'solarized-light', label: 'Solarized Light' },
    { value: 'chrome', label: 'Chrome' },
    { value: 'quietlight', label: 'Quiet Light' },
  ],
  dark: [
    { value: 'github-dark', label: 'GitHub Dark (默认)' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'dracula', label: 'Dracula' },
    { value: 'nord', label: 'Nord' },
  ]
}

export function CodeEditor({ isOpen, onOpenChange }: CodeEditorProps) {
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

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // 注册自定义主题
    monaco.editor.defineTheme('github-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
        { token: 'type', foreground: 'ffa657' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#c9d1d9',
        'editor.lineHighlightBackground': '#161b22',
        'editorCursor.foreground': '#c9d1d9',
        'editorWhitespace.foreground': '#484f58',
        'editorIndentGuide.background': '#484f58',
        'editor.selectionBackground': '#264f78',
      },
    })

    monaco.editor.defineTheme('chrome', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '0B660B', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'AA0D91' },
        { token: 'string', foreground: '1A1AA6' },
        { token: 'number', foreground: '1C00CF' },
        { token: 'type', foreground: 'FF0000' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F5F5F5',
        'editorCursor.foreground': '#000000',
        'editorWhitespace.foreground': '#E8E8E8',
        'editorIndentGuide.background': '#E8E8E8',
        'editor.selectionBackground': '#B5D5FF',
      },
    })

    monaco.editor.defineTheme('nord', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '616E88', fontStyle: 'italic' },
        { token: 'keyword', foreground: '81A1C1' },
        { token: 'string', foreground: 'A3BE8C' },
        { token: 'number', foreground: 'B48EAD' },
        { token: 'type', foreground: '8FBCBB' },
      ],
      colors: {
        'editor.background': '#2E3440',
        'editor.foreground': '#D8DEE9',
        'editor.lineHighlightBackground': '#3B4252',
        'editorCursor.foreground': '#D8DEE9',
        'editorWhitespace.foreground': '#434C5E',
        'editorIndentGuide.background': '#434C5E',
        'editor.selectionBackground': '#434C5E',
      },
    })

    monaco.editor.defineTheme('quietlight', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '998066', fontStyle: 'italic' },
        { token: 'keyword', foreground: '4B83CD' },
        { token: 'string', foreground: '448C27' },
        { token: 'number', foreground: 'AB6526' },
        { token: 'type', foreground: '7A3E9D' },
      ],
      colors: {
        'editor.background': '#F5F5F5',
        'editor.foreground': '#333333',
        'editor.lineHighlightBackground': '#E4F6D4',
        'editorCursor.foreground': '#333333',
        'editorWhitespace.foreground': '#AAAAAA',
        'editorIndentGuide.background': '#AAAAAA',
        'editor.selectionBackground': '#C9D0D9',
      },
    })

    // 配置编辑器选项
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: fontSize,
      lineNumbers: "on",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      tabSize: tabSize,
      insertSpaces: true,
      wordWrap: "on",
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      snippetSuggestions: "top",
      suggest: {
        localityBonus: true,
        showIcons: true,
        maxVisibleSuggestions: 12,
        selectionMode: 'always',
        snippetsPreventQuickSuggestions: false
      }
    })
  }

  React.useEffect(() => {
    setEditorTheme(theme === 'dark' ? 'github-dark' : 'github')
  }, [theme])

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
  }

  const handleDebug = async () => {
    try {
      setIsDebugging(true)
      const result = await debugCode({
        language,
        code,
        input,
        time_limit: 1000,
        memory_limit: 256
      })
      setDebugResult(result)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '调试失败')
    } finally {
      setIsDebugging(false)
    }
  }

  return (
    <div className={cn(
      "absolute top-0 right-0 h-[calc(100vh-4rem)] w-[800px] bg-background border-l shadow-lg transition-all duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <style>{monacoStyles}</style>
      <div className="h-full flex flex-col">
        <div className="p-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择语言" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCode("")}
              title="清空代码"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>编辑器设置</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="px-2 py-1.5">
                <div className="text-sm mb-2">字体大小</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setFontSize(prev => Math.max(8, prev - 1))}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center">{fontSize}px</div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setFontSize(prev => Math.min(32, prev + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <DropdownMenuSeparator />
              
              <div className="px-2 py-1.5">
                <div className="text-sm mb-2">缩进距离</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setTabSize(prev => Math.max(2, prev - 2))}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center">{tabSize} 空格</div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setTabSize(prev => Math.min(8, prev + 2))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>编辑器主题</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={editorTheme} onValueChange={setEditorTheme}>
                {themes[theme === 'dark' ? 'dark' : 'light'].map((t) => (
                  <DropdownMenuRadioItem key={t.value} value={t.value}>
                    {t.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-0">
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              theme={editorTheme}
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: fontSize,
                lineNumbers: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: tabSize,
                insertSpaces: true,
                wordWrap: "on",
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true
                },
                snippetSuggestions: "top",
                suggest: {
                  localityBonus: true,
                  showIcons: true,
                  maxVisibleSuggestions: 12,
                  selectionMode: 'always',
                  snippetsPreventQuickSuggestions: false
                },
                scrollbar: {
                  useShadows: false,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                  vertical: 'visible',
                  horizontal: 'visible',
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                  arrowSize: 0,
                }
              }}
            />
          </div>
        </div>
        <div className="border-t p-4 flex items-center justify-end gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsDebugOpen(!isDebugOpen)}
          >
            {isDebugOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
            在线调试
          </Button>
          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={() => {
              // TODO: 实现提交代码功能
              toast.info("提交代码功能开发中...")
            }}
          >
            提交代码
          </Button>
        </div>
        <div className={cn(
          "border-t bg-background overflow-hidden transition-all duration-300 ease-in-out",
          isDebugOpen ? "h-[400px] opacity-100" : "h-0 opacity-0"
        )}>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">输入数据</div>
              <Textarea
                placeholder="请输入测试数据..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-24 font-mono"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleDebug}
              disabled={isDebugging}
            >
              {isDebugging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  调试中...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  运行代码
                </>
              )}
            </Button>
            {debugResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>状态：<span className={cn(
                    "font-medium",
                    debugResult.status === "accepted" ? "text-green-500" : "text-red-500"
                  )}>{debugResult.status === "accepted" ? "通过" : "失败"}</span></div>
                  <div>
                    运行时间：{debugResult.time_used}ms | 
                    内存使用：{debugResult.memory_used}MB
                  </div>
                </div>
                <ScrollArea className="h-32 rounded-md border">
                  <div className="p-4 font-mono text-sm whitespace-pre">
                    {debugResult.error_message ? (
                      <span className="text-red-500">{debugResult.error_message}</span>
                    ) : debugResult.output}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 