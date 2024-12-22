'use client'

import * as React from "react"
import { HelpCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { type DifficultySystem } from "@/lib/problemService"

interface DifficultySystemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (system: DifficultySystem) => Promise<void>
  currentSystem: DifficultySystem
}

export function DifficultySystemDialog({
  open,
  onOpenChange,
  onConfirm,
  currentSystem
}: DifficultySystemDialogProps) {
  const [system, setSystem] = React.useState<DifficultySystem>(currentSystem)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setSystem(currentSystem)
  }, [currentSystem])

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(system)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            切换难度系统
            <Popover>
              <PopoverTrigger>
                <HelpCircle className="h-4 w-4" />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">普通系统 → OI 系统</h4>
                    <ul className="text-sm space-y-1">
                      <li>暂无评级 → 暂无评级</li>
                      <li>简单 → 入门/蒟蒻</li>
                      <li>中等 → 普及-</li>
                      <li>困难 → 普及+/提高</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">OI 系统 → 普通系统</h4>
                    <ul className="text-sm space-y-1">
                      <li>暂无评级 → 暂无评级</li>
                      <li>入门/蒟蒻 → 简单</li>
                      <li>普及- → 简单</li>
                      <li>普及/提高- → 中等</li>
                      <li>普及+/提高 → 中等</li>
                      <li>提高+/省选- → 困难</li>
                      <li>省选/NOI- → 困难</li>
                      <li>NOI/NOI+/CTSC → 困难</li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </DialogTitle>
          <DialogDescription>
            切换难度系统将影响所有题目的难度等级显示。此操作不可撤销，请谨慎操作。
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <RadioGroup
            value={system}
            onValueChange={(value) => setSystem(value as DifficultySystem)}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal">普通难度系统（Normal）</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oi" id="oi" />
              <Label htmlFor="oi">OI 难度系统（OI）</Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Spinner className="mr-2 h-4 w-4" />}
            确认切换
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 