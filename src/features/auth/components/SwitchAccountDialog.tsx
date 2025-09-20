import { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { LoginRequest, LoginResponse } from '../types';
// import { ForgotPasswordDialog } from './ForgotPasswordDialog';

interface SwitchAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwitchAccountDialog = ({ isOpen, onClose }: SwitchAccountDialogProps) => {
  const [username, setUsername] = useState('lechinghia202@gmail.com');
  const [password, setPassword] = useState('Nghia290');
  const [showPassword, setShowPassword] = useState(false);
  const [saveLoginInfo, setSaveLoginInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();

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
      // TODO: Implement actual login API call
      const loginData: LoginRequest = {
        username,
        password,
        saveLogin: saveLoginInfo
      };

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Đăng nhập thành công',
        description: 'Đã chuyển sang tài khoản mới',
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Đăng nhập thất bại',
        description: 'Vui lòng kiểm tra lại thông tin đăng nhập',
        variant: 'destructive',
      });
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
              <Label htmlFor="username">Số điện thoại, tên người dùng hoặc email</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Số điện thoại, tên người dùng hoặc email"
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
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Save login info */}
            <div className="flex items-center space-x-2 pb-1.5">
              <Checkbox
                id="saveLogin"
                checked={saveLoginInfo}
                onCheckedChange={(checked) => setSaveLoginInfo(checked as boolean)}
              />
              <Label htmlFor="saveLogin" className="text-sm">
                Lưu thông tin đăng nhập
              </Label>
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
      {/* <ForgotPasswordDialog
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => setShowForgotPassword(false)}
      /> */}
    </div>
  );
};
