import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/store';
import { forgotPasswordAsync } from '../authSlice';
import { Countdown } from '@/components/common/Countdown';
import type { ResetPasswordRequest } from '../types';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>();

  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const resetData: ResetPasswordRequest = { email: data.email };
      await dispatch(forgotPasswordAsync({ email: resetData.email })).unwrap();
      
      setIsEmailSent(true);
      setIsCountdownActive(true);
      toast({
        title: 'Email đã được gửi',
        description: 'Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu',
      });
    } catch (error) {
      const err = error as { status?: number; message?: string } | string;
      const status = typeof err === 'string' ? undefined : err.status;
      if (status === 404) {
        toast({
          variant: 'destructive',
          title: 'Không tìm thấy tài khoản',
          description: 'Email không khớp với tài khoản nào.',
        });
      } else if (status === 400) {
        toast({
          variant: 'destructive',
          title: 'Yêu cầu không hợp lệ',
          description: (typeof err === 'string' ? err : err?.message) || 'Vui lòng kiểm tra lại email.',
        });
      } else {
        toast({
          title: 'Gửi email thất bại',
          description: (typeof err === 'string' ? err : err?.message) || 'Vui lòng thử lại sau',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    const formEvent = new Event('submit') as unknown as React.FormEvent;
    handleSubmit(onSubmit)(formEvent);
  };

  const handleCountdownComplete = () => {
    setIsCountdownActive(false);
  };

  const handleCountdownReset = () => {
    setIsCountdownActive(true);
  };

  return (
    <div className="bg-background/95 backdrop-blur-lg rounded-2xl shadow-strong p-8 border border-border/50 w-full max-w-md mx-auto">
      {!isEmailSent ? (
        <>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
              <Mail className="h-8 w-8" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Quên mật khẩu
            </h1>
            <p className="text-muted-foreground text-sm">
              Nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu
            </p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                className="h-11"
                {...register('email', {
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ',
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="default"
              className="h-11 w-full rounded-full font-semibold shadow-md hover:shadow-lg"
              disabled={isLoading || !email?.trim()}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-6 pt-6 border-t border-border">
            <Link
              to="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </>
      ) : (
        <>
          {/* Success State */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email đã được gửi!</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full h-11"
                disabled={isLoading || isCountdownActive}
              >
                {isLoading ? 'Đang gửi lại...' : 'Gửi lại email'}
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
              
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
