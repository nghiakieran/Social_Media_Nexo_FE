import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { OAuthButton } from './OAuthButton';
import { loginStart, loginSuccess, loginTwoFactor, loginFailure } from '../authSlice';
import type { RootState } from '@/store';
import { mockUsers, mockAuthDelay } from '../__mocks__/users';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart());
    
    try {
      await mockAuthDelay();
      
      // Mock authentication
      const user = mockUsers.find(u => u.email === data.email && u.password === data.password);
      
      if (!user) {
        dispatch(loginFailure("Email hoặc mật khẩu không chính xác"));
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: "Email hoặc mật khẩu không chính xác.",
        });
        return;
      }

      if (user.hasTwoFactor) {
        // Redirect to 2FA
        dispatch(loginTwoFactor(user.id));
        navigate('/auth/2fa', { state: { email: data.email } });
        toast({
          title: "Xác thực 2 bước",
          description: "Vui lòng nhập mã xác thực từ ứng dụng của bạn.",
        });
        return;
      }

      // Successful login
      dispatch(loginSuccess({
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.isVerified,
      }));
      
      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng trở lại, ${user.name}!`,
      });
      
      navigate('/');
    } catch (error) {
      dispatch(loginFailure("Có lỗi xảy ra. Vui lòng thử lại"));
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  };

  const handleOAuth = async (provider: string) => {
    await mockAuthDelay();
    toast({
      title: `Đăng nhập ${provider}`,
      description: "Tính năng này sẽ có sẵn sớm!",
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-instagram bg-clip-text text-transparent mb-2">
          Nexo
        </h1>
        <p className="text-muted-foreground">Đăng nhập vào tài khoản của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="pl-10"
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email không hợp lệ',
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 8,
                  message: 'Mật khẩu phải có ít nhất 8 ký tự',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="instagram"
          className="w-full h-11"
          disabled={isLoading}
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-sm text-muted-foreground">hoặc</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <OAuthButton provider="google" onAuth={handleOAuth} disabled={isLoading} />
        <OAuthButton provider="facebook" onAuth={handleOAuth} disabled={isLoading} />
      </div>

      {/* Register Link */}
      <div className="text-center mt-6 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link to="/auth/register" className="text-primary hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
