import React, { forwardRef, useState } from 'react';
import GeeTest, { GeeTestRef } from 'react-geetest-v4';
import { verifyCaptcha } from "@/lib/captchaService";
import { Button } from "@/components/ui/button"
import { toast } from 'sonner';
import { Spinner } from "@/components/ui/spinner";

const Captcha = forwardRef<GeeTestRef | null, { onSuccess: (result: any) => Promise<boolean>; requestValue: string; requestType: 'email' | 'phone' }>(({ onSuccess, requestValue, requestType }, ref) => {
  const [isCooldown, setIsCooldown] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (result: any) => {
    if (isCooldown || loading) return;

    setLoading(true);
    try {
      const data = await verifyCaptcha(result);
      console.log('Backend response: ', data);
      if (data && data.requestID) {
        const success = await onSuccess(data);
        if (success) {
          startCooldown();
        }
      } else {
        throw new Error('验证码验证失败，未返回有效的 requestID');
      }
    } catch (error) {
      console.error('Error during captcha verification:', error);
      const errorMessage = (error as any)?.response?.data?.error || '验证码验证失败，请重试';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startCooldown = () => {
    setIsCooldown(true);
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCooldown(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div style={{ pointerEvents: isCooldown || loading ? 'none' : 'auto' }}>
      <GeeTest
        ref={ref}
        captchaId={'a50ddb63a0a0efb9199a36ad21cfda36'}
        product="bind"
        onSuccess={handleSuccess}
      >
        <Button disabled={isCooldown || loading}>
          {loading ? <Spinner /> : (isCooldown ? `${countdown} 秒后重新获取` : '获取验证码')}
        </Button>
      </GeeTest>
    </div>
  );
});

Captcha.displayName = 'Captcha';

export default Captcha;
