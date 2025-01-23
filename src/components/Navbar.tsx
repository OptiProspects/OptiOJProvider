'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User2, Settings, LogOut, Trophy, BookText, Users, Bell, ShieldCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/config/apiConfig";
import { useRouter, usePathname } from "next/navigation";
import { getAvatar } from "@/lib/profileService";
import { getUnreadCount } from '@/lib/messageService';
import { Badge } from "@/components/ui/badge";
import { logoutService } from "@/lib/sessionService";
import { toast } from 'sonner';

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
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('/user/globalData');
        const userData = response.data.user;
        setUser(userData);
        
        // 获取头像
        if (userData.avatar) {
          const { avatarUrl } = await getAvatar(userData.avatar);
          setAvatarUrl(avatarUrl);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUser(null);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const data = await getUnreadCount();
        setUnreadCount(data.total);
      } catch (error) {
        console.error('获取未读消息数量失败:', error);
      }
    };

    const token = localStorage.getItem('access_token');
    if (token) {
      setLoading(true);
      Promise.all([fetchUserData(), fetchUnreadCount()]).finally(() => {
        setLoading(false);
      });

      // 设置定时器，每30秒更新一次未读消息数量
      const timer = setInterval(fetchUnreadCount, 30000);

      return () => {
        clearInterval(timer);
        if (avatarUrl) {
          URL.revokeObjectURL(avatarUrl);
        }
      };
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logoutService();
      toast.success('成功退出登录');
      if (pathname === '/') {
        window.location.reload();
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('退出登录失败:', error);
      toast.error('退出登录失败');
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 text-gray-900 p-4 sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto flex justify-between items-center">
        <ul className="flex space-x-2">
          <li>
            <Button
              variant="ghost"
              className={`h-8 ${pathname === '/' ? 'bg-accent' : ''}`}
              onClick={() => router.push('/')}
            >
              首页
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={`h-8 ${pathname === '/problems' ? 'bg-accent' : ''}`}
              onClick={() => router.push('/problems')}
            >
              题目列表
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={`h-8 ${pathname === '/about' ? 'bg-accent' : ''}`}
              onClick={() => router.push('/about')}
            >
              关于我们
            </Button>
          </li>
        </ul>
        
        <div className="flex gap-2 items-center">
          {loading ? (
            <Button variant="ghost" className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </Button>
          ) : user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={`relative ${pathname === '/messages' ? 'bg-accent' : ''}`}
                asChild
              >
                <Link href="/messages">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>

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
                    <Link href="/teams" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      我的团队
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/ranking" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      我的排名
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/account-security" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      账号安全
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
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-red-600 cursor-pointer" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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
