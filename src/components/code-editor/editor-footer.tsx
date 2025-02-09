'use client'

import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditorFooterProps {
  isDebugOpen: boolean
  onDebugOpenChange: (open: boolean) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function EditorFooter({
  isDebugOpen,
  onDebugOpenChange,
  onSubmit,
  isSubmitting
}: EditorFooterProps) {
  return (
    <div className="border-t p-4 flex items-center justify-end gap-4">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => onDebugOpenChange(!isDebugOpen)}
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
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "提交中..." : "提交代码"}
      </Button>
    </div>
  )
} 