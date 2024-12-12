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
import { useState } from "react";

export default function RegisterPage() {
  const captchaRef = React.useRef(null);
  const [activeTab, setActiveTab] = React.useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleCaptchaSuccess = (data: any) => {
    console.log('Captcha verified successfully:', data);
    // 这里可以处理后续逻辑
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Tabs defaultValue="email" className="w-[400px]">
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      console.log('Updated email:', e.target.value); // 添加日志
                    }}  
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
