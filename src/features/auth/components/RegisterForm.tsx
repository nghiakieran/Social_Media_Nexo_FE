import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AtSign,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 rounded-full border border-input/80 bg-background/80 pl-10 pr-3 text-sm shadow-[inset_0_1px_0_rgba(0,0,0,0.03)] transition-all placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 sm:h-12 sm:pl-11 sm:pr-4";

export const RegisterForm = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const goToStep2 = async () => {
    const ok = await trigger(["fullname", "username", "email"]);
    if (ok) setStep(2);
  };

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

      if (result.userId) {
        navigate(`/auth/register-success?userId=${result.userId}`);
      } else {
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

  const labelClass =
    "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs";

  const iconLeft = "left-3.5 sm:left-4";

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        className="mb-3 flex gap-1.5 sm:mb-4"
        aria-label="Tiến trình đăng ký"
      >
        <span
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            step >= 1 ? "bg-primary" : "bg-muted"
          )}
        />
        <span
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            step >= 2 ? "bg-primary" : "bg-muted"
          )}
        />
      </div>

      <div className="mb-3 space-y-1 sm:mb-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Tạo tài khoản
        </h1>
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {step === 1
            ? "Nhập họ tên, tên người dùng và email để bắt đầu."
            : "Đặt mật khẩu an toàn cho tài khoản của bạn."}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 1) {
            void goToStep2();
            return;
          }
          void handleSubmit(onSubmit)(e);
        }}
        className="space-y-3 sm:space-y-4"
      >
        <div className={cn("space-y-3", step !== 1 && "hidden")}>
          <div className="space-y-1.5">
            <Label htmlFor="fullname" className={labelClass}>
              Họ tên
            </Label>
            <div className="relative">
              <User
                className={cn(
                  "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  iconLeft
                )}
              />
              <Input
                id="fullname"
                placeholder="Nguyễn Văn A"
                className={cn(fieldClass, "pl-10 sm:pl-11")}
                autoComplete="name"
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
              <p className="text-xs text-destructive sm:text-sm">
                {errors.fullname.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className={labelClass}>
              Tên người dùng
            </Label>
            <div className="relative">
              <AtSign
                className={cn(
                  "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  iconLeft
                )}
              />
              <Input
                id="username"
                placeholder="username"
                className={cn(fieldClass, "pl-10 sm:pl-11")}
                autoComplete="username"
                {...register("username", {
                  required: "Tên người dùng là bắt buộc",
                  minLength: {
                    value: 3,
                    message: "Tên người dùng phải có ít nhất 3 ký tự",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message:
                      "Tên người dùng chỉ được chứa chữ, số và gạch dưới",
                  },
                })}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-destructive sm:text-sm">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className={labelClass}>
              Email
            </Label>
            <div className="relative">
              <Mail
                className={cn(
                  "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  iconLeft
                )}
              />
              <Input
                id="email"
                type="email"
                placeholder="ten@nexo.com"
                className={cn(fieldClass, "pl-10 sm:pl-11")}
                autoComplete="email"
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
              <p className="text-xs text-destructive sm:text-sm">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="default"
            className="group mt-1 h-11 w-full rounded-full text-sm font-semibold shadow-md hover:shadow-lg sm:h-12 sm:text-base"
            onClick={goToStep2}
          >
            Tiếp tục
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        <div className={cn("space-y-3", step !== 2 && "hidden")}>
          <Button
            type="button"
            variant="outline"
            className="-ml-2 mb-1 h-9 gap-1 rounded-full border-primary/40 px-3 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary sm:text-sm"
            onClick={() => setStep(1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <div className="space-y-1.5">
            <Label htmlFor="password" className={labelClass}>
              Mật khẩu
            </Label>
            <div className="relative">
              <Lock
                className={cn(
                  "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  iconLeft
                )}
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={cn(fieldClass, "pl-10 pr-11 sm:pl-11 sm:pr-12")}
                autoComplete="new-password"
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:right-3"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive sm:text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className={labelClass}>
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <Lock
                className={cn(
                  "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  iconLeft
                )}
              />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={cn(fieldClass, "pl-10 pr-11 sm:pl-11 sm:pr-12")}
                autoComplete="new-password"
                {...register("confirmPassword", {
                  required: "Vui lòng xác nhận mật khẩu",
                  validate: (value) =>
                    value === password || "Mật khẩu xác nhận không khớp",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:right-3"
                aria-label={
                  showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive sm:text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="default"
            className="group mt-1 h-11 w-full rounded-full text-sm font-semibold shadow-md hover:shadow-lg sm:h-12 sm:text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              "Đang tạo tài khoản..."
            ) : (
              <>
                Đăng ký
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {step === 2 && (
        <>
          <div className="my-5 flex items-center gap-3 sm:my-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/90">
              Hoặc tiếp tục với
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <OAuthButton
            provider="google"
            onAuth={handleOAuth}
            disabled={isLoading}
            className="h-11 rounded-full text-sm shadow-sm sm:h-12"
          />
        </>
      )}

      <div
        className={cn(
          "border-t border-border/60 pt-4 text-center sm:pt-5",
          step === 1 ? "mt-5 sm:mt-6" : "mt-5 sm:mt-6"
        )}
      >
        <p className="text-xs text-muted-foreground sm:text-sm">
          Đã có tài khoản?{" "}
          <Link
            to={AUTH_LOGIN_ENDPOINT}
            className="font-semibold text-primary transition-colors hover:text-primary/90 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
