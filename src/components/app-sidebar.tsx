"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  UserCogIcon
} from "lucide-react"
import { getUserData, getAvatar } from "@/lib/profileService"
import { useEffect, useState } from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  navMain: [
    {
      title: "用户管理",
      url: "#",
      icon: UserCogIcon,
      isActive: true,
      items: [
        {
          title: "基础用户管理",
          url: "/panel/users",
        },
        {
          title: "管理员管理",
          url: "/panel/users/admin",
        },
        {
          title: "导入用户",
          url: "#",
        },
        {
          title: "生成用户",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取用户基本信息
        const userData = await getUserData()
        // 获取头像
        const { avatarUrl } = await getAvatar()
        
        setUser({
          name: userData.user.username,
          email: userData.user.email,
          avatar: avatarUrl,
        })
      } catch (error) {
        console.error("获取用户数据失败:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
