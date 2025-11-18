import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, User, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { OAuthButton } from "./OAuthButton";
import { useAppDispatch, useAppSelector } from "@/store";
import { registerAsync } from "../authSlice";
import { mockAuthDelay } from "../__mocks__/users";
import type { RegisterFormData } from "../types";
import { AUTH_LOGIN_ENDPOINT } from "@/utils/constants";

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await dispatch(
        registerAsync({
          email: data.email,
          username: data.username,
          fullname: data.fullname,
          password: data.password,
        })
      ).unwrap();

      // Chuyển hướng đến trang thông báo đăng ký thành công với userId
      if (result.userId) {
        navigate(`/auth/register-success?userId=${result.userId}`);
      } else {
        // Fallback nếu không có userId
        toast({
          title: "Đăng ký thành công!",
          description: "Vui lòng kiểm tra email để xác thực tài khoản.",
        });
        navigate(AUTH_LOGIN_ENDPOINT);
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: (error as string) || "Có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  };

  const handleOAuth = async (provider: string) => {
    await mockAuthDelay();
    toast({
      title: `Đăng ký ${provider}`,
      description: "Tính năng này sẽ có sẵn sớm!",
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-instagram bg-clip-text text-transparent mb-2">
          Nexo
        </h1>
        <p className="text-muted-foreground">Tạo tài khoản mới</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullname">Họ tên</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullname"
              placeholder="Nguyen Van A"
              className="pl-10"
              {...register("fullname", {
                required: "Họ tên là bắt buộc",
                minLength: {
                  value: 2,
                  message: "Họ tên phải có ít nhất 2 ký tự",
                },
              })}
            />
          </div>
          {errors.fullname && (
            <p className="text-sm text-destructive">
              {errors.fullname.message}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Tên người dùng</Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              placeholder="username"
              className="pl-10"
              {...register("username", {
                required: "Tên người dùng là bắt buộc",
                minLength: {
                  value: 3,
                  message: "Tên người dùng phải có ít nhất 3 ký tự",
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: "Tên người dùng chỉ được chứa chữ, số và gạch dưới",
                },
              })}
            />
          </div>
          {errors.username && (
            <p className="text-sm text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

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
              {...register("email", {
                required: "Email là bắt buộc",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email không hợp lệ",
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
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register("password", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 8,
                  message: "Mật khẩu phải có ít nhất 8 ký tự",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-hidden="true"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register("confirmPassword", {
                required: "Vui lòng xác nhận mật khẩu",
                validate: (value) =>
                  value === password || "Mật khẩu xác nhận không khớp",
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              aria-hidden="true"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="instagram"
          className="w-full h-11"
          disabled={isLoading}
        >
          {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
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
        <OAuthButton
          provider="google"
          onAuth={handleOAuth}
          disabled={isLoading}
        />
      </div>

      {/* Login Link */}
      <div className="text-center mt-6 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link
            to={AUTH_LOGIN_ENDPOINT}
            className="text-primary hover:underline font-medium"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
