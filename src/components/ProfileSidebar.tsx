'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { UserIcon, BellIcon, ShieldIcon, KeyIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

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

export function ProfileSidebar({ userData }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Card>
      <CardContent className="p-4">
        <nav className="flex flex-col space-y-1">
          {sidebarNavItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                pathname === item.href && "bg-muted"
              )}
              onClick={() => {
                router.push(item.href)
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Button>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}
