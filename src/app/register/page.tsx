'use client'

import * as React from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Captcha from "@/components/Captcha";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { sendVerificationCode } from "@/lib/captchaService";

export default function RegisterPage() {
  const captchaRef = React.useRef(null);
  const [activeTab, setActiveTab] = React.useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const requestValueRef = useRef<string | null>(null);

  useEffect(() => {
    requestValueRef.current = activeTab === 'email' ? email : phone;
  }, [email, phone, activeTab]);

  const handleCaptchaSuccess = async (data: any) => {
    console.log('Captcha verified successfully:', data);
    const requestValue = requestValueRef.current;
    const requestType = activeTab;

    console.log('Request Value:', requestValue);
    console.log('Request Type:', requestType);

    if (requestValue && data.requestID) {
      await handleSendCode(data.requestID, requestValue, requestType as 'email' | 'phone');
    } else {
      console.error('Request value or requestID is not available. Please verify the captcha first.');
    }
  };

  const handleSendCode = async (id: string, value: string, requestType: 'email' | 'phone') => {
    console.log('Sending code to:', value);

    if (!id) {
      console.error('Request ID is not available. Please verify the captcha first.');
      return;
    }

    try {
      const data = await sendVerificationCode(value, requestType, id);
      console.log('Verification code sent successfully:', data);
      toast.success('验证码发送成功');
    } catch (error) {
      console.error('Error sending verification code:', error);
      const errorMessage = (error as any)?.response?.data?.error || '验证码发送失败，遇到了预期外的错误';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Tabs defaultValue="email" className="w-[400px]" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">邮箱注册</TabsTrigger>
          <TabsTrigger value="phone">手机号注册</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>邮箱注册</CardTitle>
              <CardDescription>请输入您的邮箱和密码进行注册。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="username">用户名</Label>
                <Input id="username" type="text" placeholder="请输入您的用户名" className="flex-1" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">邮箱</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="请输入您的邮箱" 
                    className="flex-1" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}  
                  />
                  <div className="flex-shrink-0">
                    <Captcha 
                      onSuccess={handleCaptchaSuccess} 
                      ref={captchaRef} 
                      requestValue={email} 
                      requestType="email" 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="captcha">验证码</Label>
                <Input id="captcha" type="text" placeholder="请输入验证码" className="flex-1" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" placeholder="请输入您的密码" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">注册</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="phone">
          <Card>
            <CardHeader>
              <CardTitle>手机号注册</CardTitle>
              <CardDescription>请输入您的手机号和密码进行注册。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="username">用户名</Label>
                <Input id="username" type="text" placeholder="请输入您的用户名" className="flex-1" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">手机号</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="请输入您的手机号" 
                    className="flex-1" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                  <div className="flex-shrink-0">
                    <Captcha 
                      onSuccess={handleCaptchaSuccess} 
                      ref={captchaRef} 
                      requestValue={phone} 
                      requestType="phone" 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="captcha">验证码</Label>
                <Input id="captcha" type="text" placeholder="请输入验证码" className="flex-1" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" placeholder="请输入您的密码" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">注册</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
