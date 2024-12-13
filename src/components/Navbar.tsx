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

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserInfo();
        setUser(userData);
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem('access_token')) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 text-gray-900 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <ul className="flex space-x-4">
          <li><Link href="/" className="hover:underline">首页</Link></li>
          <li><Link href="/problems" className="hover:underline">题目列表</Link></li>
          <li><Link href="/about" className="hover:underline">关于我们</Link></li>
        </ul>
        
        <div className="flex gap-2">
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/profile">个人资料</Link>
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
            )
          )}
        </div>
      </div>
    </nav>
  );
} 
