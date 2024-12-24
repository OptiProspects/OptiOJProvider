'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getUserInfo } from "@/lib/authService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User2, Settings, LogOut, Trophy, BookText } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/config/apiConfig";

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserInfo();
        setUser(userData);
        
        // 获取头像
        const response = await apiClient.get('/user/getAvatar', {
          responseType: 'blob'
        });
        const url = URL.createObjectURL(response.data);
        setAvatarUrl(url);
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUser(null);
      }
    };

    const token = localStorage.getItem('access_token');
    if (token) {
      setLoading(true);
      fetchUserData().finally(() => {
        setLoading(false);
      });
    }
  }, []);

  // 在组件卸载时清理 URL
  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 text-gray-900 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <ul className="flex space-x-4">
          <li><Link href="/" className="hover:underline">首页</Link></li>
          <li><Link href="/problems" className="hover:underline">题目列表</Link></li>
          <li><Link href="/about" className="hover:underline">关于我们</Link></li>
        </ul>
        
        <div className="flex gap-2">
          {loading ? (
            <Button variant="ghost" className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={avatarUrl} alt={user.username} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={avatarUrl} alt={user.username} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {user.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User2 className="h-4 w-4" />
                    个人资料
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/submissions" className="flex items-center gap-2">
                    <BookText className="h-4 w-4" />
                    我的提交
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/ranking" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    我的排名
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <DropdownMenuItem>
                    <Link href="/panel" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      后台管理
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/register">注册</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 
