'use client'

import * as React from "react"
import Editor, { loader } from "@monaco-editor/react"
import { Spinner } from "@/components/ui/spinner"

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

interface MonacoEditorProps {
  code: string
  onChange: (value: string | undefined) => void
  language: string
  theme: string
  fontSize: number
  tabSize: number
  onMount?: (editor: any, monaco: any) => void
}

export function MonacoEditor({
  code,
  onChange,
  language,
  theme,
  fontSize,
  tabSize,
  onMount
}: MonacoEditorProps) {
  React.useEffect(() => {
    // 在客户端初始化 Monaco Editor
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

    loader.init().then(() => {
      // 语言支持已加载
    })
  }, [])

  return (
    <>
      <style>{monacoStyles}</style>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme={theme}
        value={code}
        onChange={onChange}
        onMount={onMount}
        loading={<div className="h-full w-full flex items-center justify-center"><Spinner className="w-8 h-8" /></div>}
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
    </>
  )
} 