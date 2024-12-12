import React, { forwardRef, useState, useEffect, useRef } from 'react';
import GeeTest, { GeeTestRef } from 'react-geetest-v4';
import { verifyCaptcha, sendVerificationCode } from "@/lib/captchaService";
import { Button } from "@/components/ui/button"

const Captcha = forwardRef<GeeTestRef | null, { onSuccess: (result: any) => void; requestValue: string; requestType: 'email' | 'phone' }>(({ onSuccess, requestValue, requestType }, ref) => {
  console.log('Received requestValue in Captcha:', requestValue);

  const [requestID, setRequestID] = useState<string | null>(null);

  const requestValueRef = useRef(requestValue);

  useEffect(() => {
    requestValueRef.current = requestValue;
  }, [requestValue]);

  const handleSuccess = async (result: any) => {
    console.log('Captcha result: ', result);
    console.log('Current requestValue:', requestValueRef.current)
    try {
      const data = await verifyCaptcha(result);
      console.log('Backend response: ', data);
      setRequestID(data.requestID);
      onSuccess(data);
      await handleSendCode(data.requestID, requestValueRef.current);
    } catch (error) {
      console.error('Error during captcha verification:', error);
    }
  };

  const handleSendCode = async (id: string, value: string) => {
    console.log('Sending code to:', value);

    if (!id) {
      console.error('Request ID is not available. Please verify the captcha first.');
      return;
    }

    try {
      const data = await sendVerificationCode(value, requestType, id);
      console.log('Verification code sent successfully:', data);
    } catch (error) {
      console.error('Error sending verification code:', error);
    }
  };

  return (
    <>
      <GeeTest
        ref={ref}
        captchaId={'a50ddb63a0a0efb9199a36ad21cfda36'}
        product="bind"
        onSuccess={handleSuccess}
      >
        <Button>获取验证码</Button>
      </GeeTest>
    </>
  );
});

Captcha.displayName = 'Captcha';

export default Captcha;
