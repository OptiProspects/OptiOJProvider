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

export default function RegisterPage() {
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
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" placeholder="请输入您的邮箱" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" placeholder="请输入您的密码" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>注册</Button>
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
                <Label htmlFor="phone">手机号</Label>
                <Input id="phone" type="tel" placeholder="请输入您的手机号" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" placeholder="请输入您的密码" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>注册</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
