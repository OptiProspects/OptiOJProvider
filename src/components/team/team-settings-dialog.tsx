'use client'

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { ImagePlus, PencilIcon, UploadIcon, TrashIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateTeam, uploadTeamAvatar, getTeamAvatarUrl } from "@/lib/teamService"
import type { TeamDetail } from "@/lib/teamService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarCropper } from '@/components/AvatarCropper'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const formSchema = z.object({
  name: z.string().min(2, "团队名称至少需要2个字符").max(50, "团队名称最多50个字符"),
  description: z.string().max(200, "团队描述最多200个字符").optional(),
})

interface TeamSettingsDialogProps {
  team: TeamDetail
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TeamSettingsDialog({
  team,
  open,
  onOpenChange,
  onSuccess,
}: TeamSettingsDialogProps) {
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [cropperOpen, setCropperOpen] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team.name,
      description: team.description || "",
    },
  })

  React.useEffect(() => {
    if (team.avatar) {
      setAvatarPreview(getTeamAvatarUrl(team))
    }
  }, [team])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("头像文件大小不能超过2MB")
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error("请上传图片文件")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
    event.target.value = ''
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    const newFile = new File([croppedBlob], 'avatar.png', { type: 'image/png' })
    setAvatarFile(newFile)
    setAvatarPreview(URL.createObjectURL(croppedBlob))
    setCropperOpen(false)
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(getTeamAvatarUrl(team))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateTeam(team.id, values)

      if (avatarFile) {
        await uploadTeamAvatar(team.id, avatarFile)
      }

      toast.success("团队信息更新成功")
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error("团队信息更新失败")
    }
  }

  React.useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview !== getTeamAvatarUrl(team)) {
        URL.revokeObjectURL(avatarPreview)
      }
      if (selectedImage && selectedImage.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImage)
      }
    }
  }, [avatarPreview, selectedImage, team])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>团队设置</DialogTitle>
          <DialogDescription>
            更新团队的基本信息。
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-[200px_1fr] gap-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={avatarPreview || undefined} alt="Avatar preview" />
                <AvatarFallback>
                  <ImagePlus className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    上传头像
                  </DropdownMenuItem>
                  {avatarPreview && (
                    <DropdownMenuItem onClick={removeAvatar}>
                      <TrashIcon className="mr-2 h-4 w-4" />
                      删除头像
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              支持 jpg、png 格式<br />文件大小不超过 2MB
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>团队名称</FormLabel>
                    <FormControl>
                      <Input placeholder="输入团队名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>团队描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入团队描述（可选）"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>

        <AvatarCropper
          open={cropperOpen}
          onClose={() => setCropperOpen(false)}
          imageUrl={selectedImage || ''}
          onCropComplete={handleCropComplete}
        />
      </DialogContent>
    </Dialog>
  )
} 