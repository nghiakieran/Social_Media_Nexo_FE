import { useState, useEffect } from 'react';
import { X, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Countdown } from '@/components/common/Countdown';
import type { ResetPasswordRequest } from '../types';
import { useAppDispatch } from '@/store';
import { forgotPasswordAsync } from '../authSlice';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordDialog = ({ isOpen, onClose, onBackToLogin }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setIsEmailSent(false);
      setIsCountdownActive(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const resetData: ResetPasswordRequest = { email };
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
    handleSubmit(formEvent);
  };

  const handleCountdownComplete = () => {
    setIsCountdownActive(false);
  };

  const handleCountdownReset = () => {
    setIsCountdownActive(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToLogin}
            className="w-6 h-6 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold">Quên mật khẩu</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-6 h-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isEmailSent ? (
            <>
              {/* Instructions */}
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Đặt lại mật khẩu</h3>
                <p className="text-sm text-muted-foreground">
                  Nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu
                </p>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    required
                    className="h-10"
                  />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="h-11 w-full rounded-full font-semibold shadow-md hover:shadow-lg"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email đã được gửi!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>
                </p>
                
                <div className="space-y-3">
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      onClick={handleResendEmail}
                      variant="outline"
                      className="w-full h-10"
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
                  </div>
                  
                  <Button
                    onClick={onBackToLogin}
                    variant="ghost"
                    className="w-full h-10"
                  >
                    Quay lại đăng nhập
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
