import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Countdown } from '@/components/common/Countdown';
import type { VerifyResetCodeRequest, VerifyResetCodeResponse } from '../types';

export const VerifyResetCodePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      toast({
        title: 'Email không hợp lệ',
        description: 'Không tìm thấy email trong liên kết',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [email, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast({
        title: 'Mã xác thực không hợp lệ',
        description: 'Mã xác thực phải có 6 chữ số',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual verify code API call
      const verifyData: VerifyResetCodeRequest = {
        email: email!,
        code
      };

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      setIsVerified(true);
      setIsCountdownActive(true);
      
      toast({
        title: 'Xác thực thành công',
        description: 'Mã xác thực đã được xác nhận',
      });
    } catch (error) {
      toast({
        title: 'Xác thực thất bại',
        description: 'Mã xác thực không đúng hoặc đã hết hạn',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement resend code API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsCountdownActive(true);
      toast({
        title: 'Mã xác thực đã được gửi lại',
        description: 'Vui lòng kiểm tra email của bạn',
      });
    } catch (error) {
      toast({
        title: 'Gửi lại mã thất bại',
        description: 'Vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountdownComplete = () => {
    setIsCountdownActive(false);
  };

  const handleCountdownReset = () => {
    setIsCountdownActive(true);
  };

  const handleCountdownCompleteSuccess = () => {
    navigate(`/reset-password?token=verified&email=${email}`);
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Xác thực thành công!</h1>
              <p className="text-muted-foreground mb-6">
                Bạn sẽ được chuyển đến trang đặt lại mật khẩu sau:
              </p>
              
              <Countdown
                initialSeconds={3}
                onComplete={handleCountdownCompleteSuccess}
                showResetButton={false}
                className="justify-center mb-4"
              />
              
              <Button
                onClick={() => navigate(`/reset-password?token=verified&email=${email}`)}
                className="w-full"
              >
                Đặt lại mật khẩu ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-lg font-semibold">Xác thực mã OTP</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Nhập mã xác thực</CardTitle>
            <p className="text-sm text-muted-foreground">
              Chúng tôi đã gửi mã xác thực 6 chữ số đến <strong>{email}</strong>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* OTP Input */}
              <div className="space-y-2">
                <Label htmlFor="code">Mã xác thực</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                  }}
                  placeholder="Nhập mã 6 chữ số"
                  required
                  className="h-12 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Nhập mã 6 chữ số từ email của bạn
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? 'Đang xác thực...' : 'Xác thực mã'}
              </Button>
            </form>

            {/* Resend Code */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Không nhận được mã?
              </p>
              
              <div className="flex flex-col items-center gap-2">
                <Button
                  onClick={handleResendCode}
                  variant="outline"
                  className="w-full h-10"
                  disabled={isLoading || isCountdownActive}
                >
                  {isLoading ? 'Đang gửi lại...' : 'Gửi lại mã'}
                </Button>
                
                {isCountdownActive && (
                  <Countdown
                    initialSeconds={60}
                    onComplete={handleCountdownComplete}
                    onReset={handleCountdownReset}
                    showResetButton={false}
                    className="justify-center"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
