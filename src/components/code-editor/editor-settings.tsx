'use client'

import * as React from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
} as const

interface EditorSettingsProps {
  fontSize: number
  onFontSizeChange: (size: number) => void
  tabSize: number
  onTabSizeChange: (size: number) => void
  editorTheme: string
  onThemeChange: (theme: string) => void
  currentTheme: 'light' | 'dark'
}

export function EditorSettings({
  fontSize,
  onFontSizeChange,
  tabSize,
  onTabSizeChange,
  editorTheme,
  onThemeChange,
  currentTheme = 'light'
}: EditorSettingsProps) {
  // 确保currentTheme是有效值
  const safeCurrentTheme = currentTheme === 'dark' ? 'dark' : 'light'
  const currentThemes = themes[safeCurrentTheme] || themes.light

  return (
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
              onClick={() => onFontSizeChange(Math.max(8, fontSize - 1))}
            >
              -
            </Button>
            <div className="flex-1 text-center">{fontSize}px</div>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => onFontSizeChange(Math.min(32, fontSize + 1))}
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
              onClick={() => onTabSizeChange(Math.max(2, tabSize - 2))}
            >
              -
            </Button>
            <div className="flex-1 text-center">{tabSize} 空格</div>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => onTabSizeChange(Math.min(8, tabSize + 2))}
            >
              +
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>编辑器主题</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={editorTheme} onValueChange={onThemeChange}>
          {currentThemes.map((t) => (
            <DropdownMenuRadioItem key={t.value} value={t.value}>
              {t.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 