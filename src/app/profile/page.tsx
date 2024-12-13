'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserIcon, BellIcon, ShieldIcon, KeyIcon } from "lucide-react"

const sidebarNavItems = [
  {
    title: "个人资料",
    href: "/profile",
    icon: UserIcon,
  },
  {
    title: "通知设置",
    href: "/profile/notifications",
    icon: BellIcon,
  },
  {
    title: "隐私设置",
    href: "/profile/privacy",
    icon: ShieldIcon,
  },
  {
    title: "账号安全",
    href: "/profile/security",
    icon: KeyIcon,
  },
]

const profileFormSchema = z.object({
  username: z.string().min(2, "用户名至少2个字符").max(30, "用户名最多30个字符"),
  nickname: z.string().min(2, "昵称至少2个字符").max(30, "昵称最多30个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  avatar: z.string().url("请输入有效的图片URL").optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const [avatar, setAvatar] = useState("/placeholder-avatar.jpg")

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      nickname: "",
      email: "",
      avatar: "",
    },
  })

  function onSubmit(data: ProfileFormValues) {
    console.log(data)
    // 这里处理表单提交逻辑
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人资料设置</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <Avatar className="w-24 h-24">
            <AvatarImage src={avatar} alt="头像" />
            <AvatarFallback>头像</AvatarFallback>
          </Avatar>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入用户名" {...field} />
                  </FormControl>
                  <FormDescription>
                    这是你的唯一标识，其他用户可以通过它找到你
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>昵称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入昵称" {...field} />
                  </FormControl>
                  <FormDescription>
                    这是显示给其他用户看的名字
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入邮箱" {...field} />
                  </FormControl>
                  <FormDescription>
                    用于接收通知和重置密码
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>头像 URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="请输入头像图片链接" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e)
                        setAvatar(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    输入头像图片的URL地址
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">保存更改</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
