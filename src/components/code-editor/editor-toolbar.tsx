'use client'

import * as React from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const languages = [
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
]

interface EditorToolbarProps {
  language: string
  onLanguageChange: (lang: string) => void
  onClearCode: () => void
  children?: React.ReactNode
}

export function EditorToolbar({ 
  language, 
  onLanguageChange, 
  onClearCode,
  children 
}: EditorToolbarProps) {
  return (
    <div className="p-2 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Select value={language} onValueChange={onLanguageChange}>
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
          onClick={onClearCode}
          title="清空代码"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </div>
  )
} 