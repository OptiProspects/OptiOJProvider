'use client'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { login } from "@/lib/authService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { AxiosError } from "axios";

export default function LoginPage() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!account || !password) {
      toast.error('请填写所有必填字段');
      return;
    }

    setIsLoading(true);
    try {
      await login(account, password);
      toast.success('登录成功，欢迎回来 ( •̀ ω •́ )✧');
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.error || '登录失败，请检查账号密码';
        toast.error(errorMessage);
      } else {
        toast.error('登录时发生未知错误');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>请输入您的凭据以登录。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="account">账号</Label>
                <Input 
                  id="account" 
                  type="text" 
                  placeholder="请输入您的用户名 / 手机号 / 邮箱"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">密码</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="请输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            取消
          </Button>
          <Button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? <Spinner /> : '登录'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
