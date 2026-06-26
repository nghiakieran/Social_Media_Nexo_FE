import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { OAuthButton } from "./OAuthButton";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginAsync } from "../authSlice";
import type { LoginFormData } from "../types";
import {
  AUTH_REGISTER_ENDPOINT,
  ACCESS_TOKEN_STORAGE_KEY,
  OAUTH_AUTH_BASE_URL,
} from "@/utils/constants";
import { cn, hasAdminRole } from "@/lib/utils";

const fieldClass =
  "h-12 rounded-full border border-input/80 bg-background/80 pl-11 pr-4 text-sm shadow-[inset_0_1px_0_rgba(0,0,0,0.03)] transition-all placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginAsync(data)).unwrap();

      toast({
        variant: "success",
        title: "Đăng nhập thành công!",
        description: "Chào mừng trở lại!",
      });

      const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (hasAdminRole(accessToken)) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string } | string;
      const status = typeof err === "string" ? undefined : err.status;
      if (status === 400) {
        toast({
          variant: "destructive",
          title: "Chưa xác thực email",
          description:
            "Vui lòng kiểm tra email và xác thực tài khoản trước khi đăng nhập.",
        });
      } else if (status === 401) {
        toast({
          variant: "destructive",
          title: "Email hoặc mật khẩu không đúng",
          description: "Vui lòng kiểm tra lại thông tin đăng nhập.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description:
            (typeof err === "string" ? err : err?.message) ||
            "Có lỗi xảy ra. Vui lòng thử lại.",
        });
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("reason") === "session_expired") {
      toast({
        variant: "destructive",
        title: "Phiên đăng nhập đã hết hạn",
        description: "Vui lòng đăng nhập lại để tiếp tục.",
      });
    }
  }, [location.search, toast]);
  
  const handleOAuth = async (provider: string) => {
    const baseUrl = OAUTH_AUTH_BASE_URL ;
    const params = new URLSearchParams({
      client_id: "auth-service-client",
      redirect_uri:
        import.meta.env.VITE_OAUTH_REDIRECT_URI ||
        "http://localhost:3000/auth/oauth/callback",
      response_type: "code",
      kc_idp_hint: provider,
    });
    const authUrl = `${baseUrl}?${params.toString()}`;
    window.location.href = authUrl;
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Đăng nhập
        </h1>
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Chào mừng trở lại. Nhập email và mật khẩu để tiếp tục.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="ten@nexo.com"
              className={cn(fieldClass, "pl-11")}
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
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Mật khẩu
            </Label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-primary transition-colors hover:text-primary/90 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={cn(fieldClass, "pl-11 pr-12")}
              autoComplete="current-password"
              {...register("password", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 5,
                  message: "Mật khẩu phải có ít nhất 5 ký tự",
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
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
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(v) => setRememberMe(v === true)}
            className="h-[1.125rem] w-[1.125rem] rounded border-2 border-primary/50 data-[state=unchecked]:bg-background/80 data-[state=checked]:border-primary"
          />
          <Label
            htmlFor="remember"
            className="cursor-pointer text-sm font-normal leading-none text-foreground/90"
          >
            Duy trì đăng nhập
          </Label>
        </div>

        <Button
          type="submit"
          variant="default"
          className="group mt-1 h-11 w-full rounded-full text-sm font-semibold shadow-md hover:shadow-lg sm:h-12 sm:text-base"
          disabled={isLoading}
        >
          {isLoading ? (
            "Đang đăng nhập..."
          ) : (
            <>
              Đăng nhập
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>

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

      <div className="mt-5 border-t border-border/60 pt-5 text-center sm:mt-6 sm:pt-6">
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            to={AUTH_REGISTER_ENDPOINT}
            className="font-semibold text-primary transition-colors hover:text-primary/90 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
