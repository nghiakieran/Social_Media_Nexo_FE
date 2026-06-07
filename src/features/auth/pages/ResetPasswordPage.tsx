import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Countdown } from '@/components/common/Countdown';
import type { UpdatePasswordRequest, UpdatePasswordResponse } from '../types';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Liên kết không hợp lệ',
        description: 'Token đặt lại mật khẩu không tồn tại hoặc đã hết hạn',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [token, navigate, toast]);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: {
        minLength: password.length < minLength,
        hasUpperCase: !hasUpperCase,
        hasLowerCase: !hasLowerCase,
        hasNumbers: !hasNumbers,
        hasSpecialChar: !hasSpecialChar,
      }
    };
  };

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid || !passwordsMatch) {
      toast({
        title: 'Mật khẩu không hợp lệ',
        description: 'Vui lòng kiểm tra lại yêu cầu mật khẩu',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual reset password API call
      const resetData: UpdatePasswordRequest = {
        token: token!,
        newPassword,
        confirmPassword
      };

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setIsSuccess(true);
      setIsCountdownActive(true);
      
      toast({
        title: 'Đặt lại mật khẩu thành công',
        description: 'Mật khẩu của bạn đã được cập nhật thành công',
      });
    } catch (error) {
      toast({
        title: 'Đặt lại mật khẩu thất bại',
        description: 'Có lỗi xảy ra, vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountdownComplete = () => {
    navigate('/login');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Thành công!</h1>
              <p className="text-muted-foreground mb-6">
                Mật khẩu của bạn đã được cập nhật thành công. Bạn sẽ được chuyển đến trang đăng nhập sau:
              </p>
              
              <Countdown
                initialSeconds={5}
                onComplete={handleCountdownComplete}
                showResetButton={false}
                className="justify-center mb-4"
              />
              
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Đăng nhập ngay
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
          <h1 className="text-lg font-semibold">Đặt lại mật khẩu</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Đặt lại mật khẩu mới</CardTitle>
            <p className="text-sm text-muted-foreground">
              Nhập mật khẩu mới cho tài khoản {email}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    required
                    className="h-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-0 top-0 h-10 w-10 p-0"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {/* Password Requirements */}
                {newPassword && (
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center gap-1 ${passwordValidation.errors.minLength ? 'text-red-500' : 'text-green-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.errors.minLength ? 'bg-red-500' : 'bg-green-500'}`} />
                      Ít nhất 8 ký tự
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.errors.hasUpperCase ? 'text-red-500' : 'text-green-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.errors.hasUpperCase ? 'bg-red-500' : 'bg-green-500'}`} />
                      Có chữ hoa
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.errors.hasLowerCase ? 'text-red-500' : 'text-green-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.errors.hasLowerCase ? 'bg-red-500' : 'bg-green-500'}`} />
                      Có chữ thường
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.errors.hasNumbers ? 'text-red-500' : 'text-green-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.errors.hasNumbers ? 'bg-red-500' : 'bg-green-500'}`} />
                      Có số
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.errors.hasSpecialChar ? 'text-red-500' : 'text-green-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.errors.hasSpecialChar ? 'bg-red-500' : 'bg-green-500'}`} />
                      Có ký tự đặc biệt
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    className="h-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-10 w-10 p-0"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                    <div className={`w-1 h-1 rounded-full ${passwordsMatch ? 'bg-green-500' : 'bg-red-500'}`} />
                    {passwordsMatch ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="default"
                className="h-11 w-full rounded-full font-semibold shadow-md hover:shadow-lg"
                disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
              >
                {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
