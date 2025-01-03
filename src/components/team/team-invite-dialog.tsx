'use client'

import * as React from "react"
import { toast } from "sonner"
import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTeamInvitation } from "@/lib/teamService"

interface TeamInviteDialogProps {
  teamId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeamInviteDialog({
  teamId,
  open,
  onOpenChange,
}: TeamInviteDialogProps) {
  const [inviteCode, setInviteCode] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const hasGeneratedRef = React.useRef(false)

  React.useEffect(() => {
    if (open && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true
      generateInviteCode()
    }
    if (!open) {
      hasGeneratedRef.current = false
      setInviteCode("")
    }
  }, [open])

  const generateInviteCode = async () => {
    try {
      setLoading(true)
      const invitation = await createTeamInvitation(teamId)
      setInviteCode(invitation.code)
    } catch (error) {
      toast.error("生成邀请码失败")
    } finally {
      setLoading(false)
    }
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    toast.success("邀请码已复制到剪贴板")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>邀请成员</DialogTitle>
          <DialogDescription>
            生成邀请码并分享给你想邀请的成员。邀请码24小时内有效。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>邀请码</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={inviteCode}
                readOnly
                disabled={loading}
                placeholder={loading ? "生成中..." : ""}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyInviteCode}
                disabled={!inviteCode || loading}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              hasGeneratedRef.current = true
              generateInviteCode()
            }}
            disabled={loading}
          >
            重新生成
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 