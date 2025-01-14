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
import { register } from "@/lib/authService";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const captchaRef = React.useRef(null);
  const [activeTab, setActiveTab] = React.useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const requestValueRef = useRef<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    isStrong: false,
    checks: {
      length: false,
      symbol: false,
      caseVariation: false
    },
    passedChecks: 0
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    requestValueRef.current = activeTab === 'email' ? email : phone;
  }, [email, phone, activeTab]);

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  const handleCaptchaSuccess = async (data: any) => {
    console.log('Captcha verified successfully:', data);
    const requestValue = requestValueRef.current;
    const requestType = activeTab;

    console.log('Request Value:', requestValue);
    console.log('Request Type:', requestType);

    if (requestValue && data.requestID) {
      return await handleSendCode(data.requestID, requestValue, requestType as 'email' | 'phone');
    } else {
      console.error('Request value or requestID is not available. Please verify the captcha first.');
      return false;
    }
  };

  const handleSendCode = async (id: string, value: string, requestType: 'email' | 'phone') => {
    console.log('Sending code to:', value);

    if (!id) {
      console.error('Request ID is not available. Please verify the captcha first.');
      return false;
    }

    try {
      const data = await sendVerificationCode(value, requestType, id);
      console.log('Verification code sent successfully:', data);
      toast.success('验证码发送成功');
      return true;
    } catch (error) {
      console.error('Error sending verification code:', error);
      const errorMessage = (error as any)?.response?.data?.error || '验证码发送失败，遇到了预期外的错误';
      toast.error(errorMessage);
      return false;
    }
  };

  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8 && /(?=.*[a-zA-Z])(?=.*\d)/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      caseVariation: /(?=.*[a-z])(?=.*[A-Z])/.test(password)
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    return {
      isStrong: passedChecks >= 2,
      checks,
      passedChecks
    };
  };

  const handleRegister = async () => {
    try {
      if (!username || !password) {
        toast.error('请填写用户名和密码');
        return;
      }

      if (activeTab === 'email' && !email) {
        toast.error('请填写邮箱地址');
        return;
      }

      if (activeTab === 'phone' && !phone) {
        toast.error('请填写手机号');
        return;
      }

      if (!verificationCode) {
        toast.error('请填写验证码');
        return;
      }

      const passwordCheck = checkPasswordStrength(password);
      if (!passwordCheck.isStrong) {
        let errorMessage = '密码强度不足，请确保满足以下条件中的任意两项：\n';
        if (!passwordCheck.checks.length) {
          errorMessage += '- 密码长度至少8位且包含数字和字母\n';
        }
        if (!passwordCheck.checks.symbol) {
          errorMessage += '- 包含特殊符号\n';
        }
        if (!passwordCheck.checks.caseVariation) {
          errorMessage += '- 包含大小写字母\n';
        }
        toast.error(errorMessage);
        return;
      }

      setIsRegistering(true);
      
      const registrationData = {
        userName: username,
        passWord: password,
        verificationCode: verificationCode,
        verificationType: activeTab as 'email' | 'phone',
        ...(activeTab === 'email' ? { requestEmail: email } : { requestPhone: phone })
      };

      const response = await register(registrationData);
      toast.success('注册成功，欢迎来到 OptiOJ ！ ヾ(≧▽≦*)o');
      router.push('/');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = (error as any)?.response?.data?.error || '注册失败，请重试';
      toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
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
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="请输入您的用户名" 
                  className="flex-1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
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
                <Input 
                  id="captcha" 
                  type="text" 
                  placeholder="请输入验证码" 
                  className="flex-1"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">密码</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="请输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <div className={`text-sm mt-1 overflow-hidden transition-all duration-200 ease-in-out ${
                  isPasswordFocused ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <p className={`${passwordStrength.isStrong ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordStrength.isStrong ? '恭喜，您的密码强度符合要求 u( •̀ ω •́ )y' : '您的密码强度不足，请确保满足以下条件中的任意两项：'}
                  </p>
                  <div className="text-gray-500 text-xs">
                    满足以下条件中的任意两项：
                    <ul className="list-disc list-inside">
                      <li className={passwordStrength.checks.length ? 'text-green-500' : ''}>
                        密码长度至少8位且包含数字和字母
                      </li>
                      <li className={passwordStrength.checks.symbol ? 'text-green-500' : ''}>
                        包含特殊符号
                      </li>
                      <li className={passwordStrength.checks.caseVariation ? 'text-green-500' : ''}>
                        包含大小写字母
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleRegister} disabled={isRegistering}>
                {isRegistering ? <Spinner /> : '注册'}
              </Button>
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
                <Label htmlFor="username-phone">用户名</Label>
                <Input 
                  id="username-phone" 
                  type="text" 
                  placeholder="请输入您的用户名" 
                  className="flex-1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
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
                <Input 
                  id="captcha" 
                  type="text" 
                  placeholder="请输入验证码" 
                  className="flex-1"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password-phone">密码</Label>
                <Input 
                  id="password-phone" 
                  type="password" 
                  placeholder="请输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <div className={`text-sm mt-1 overflow-hidden transition-all duration-200 ease-in-out ${
                  isPasswordFocused ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <p className={`${passwordStrength.isStrong ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordStrength.isStrong ? '恭喜，您的密码强度符合要求 u( •̀ ω •́ )y' : '您的密码强度不足，请确保满足以下条件中的任意两项：'}
                  </p>
                  <div className="text-gray-500 text-xs">
                    满足以下条件中的任意两项：
                    <ul className="list-disc list-inside">
                      <li className={passwordStrength.checks.length ? 'text-green-500' : ''}>
                        密码长度至少8位且包含数字和字母
                      </li>
                      <li className={passwordStrength.checks.symbol ? 'text-green-500' : ''}>
                        包含特殊符号
                      </li>
                      <li className={passwordStrength.checks.caseVariation ? 'text-green-500' : ''}>
                        包含大小写字母
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleRegister} 
                disabled={isRegistering}
              >
                {isRegistering ? <Spinner /> : '注册'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
