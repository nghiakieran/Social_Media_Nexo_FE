import { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { LoginRequest } from '../types';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import { useAppDispatch } from '@/store';
import { loginAsync } from '../authSlice';

interface SwitchAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwitchAccountDialog = ({ isOpen, onClose }: SwitchAccountDialogProps) => {
  const [username, setUsername] = useState('lechinghia202@gmail.com');
  const [password, setPassword] = useState('Nghia290');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginData: LoginRequest = {
        email: username,
        password,
      };
      await dispatch(loginAsync(loginData)).unwrap();
      
      toast({
        title: 'Đăng nhập thành công',
        description: 'Đã chuyển sang tài khoản mới',
      });
      
      onClose();
    } catch (error) {
      const err = error as { status?: number; message?: string } | string;
      const status = typeof err === 'string' ? undefined : err.status;
      if (status === 400) {
        toast({
          variant: 'destructive',
          title: 'Chưa xác thực email',
          description: 'Vui lòng kiểm tra email và xác thực tài khoản trước khi đăng nhập.',
        });
      } else if (status === 401) {
        toast({
          variant: 'destructive',
          title: 'Email hoặc mật khẩu không đúng',
          description: 'Vui lòng kiểm tra lại thông tin đăng nhập.',
        });
      } else {
        toast({
          title: 'Đăng nhập thất bại',
          description: (typeof err === 'string' ? err : err?.message) || 'Vui lòng thử lại sau',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="w-6" /> {/* Spacer */}
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold">Chuyển tài khoản</h2>
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
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              NEXO
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username/Email */}
            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập email..."
                required
                className="h-10"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  required
                  className="h-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-10 w-10 p-0"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-2">
            <Button
              variant="link"
              className="text-sm text-muted-foreground hover:text-foreground p-0"
              onClick={() => setShowForgotPassword(true)}
            >
              Quên mật khẩu?
            </Button>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => setShowForgotPassword(false)}
      />
    </div>
  );
};
