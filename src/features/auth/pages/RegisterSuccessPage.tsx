import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AUTH_LOGIN_ENDPOINT } from "@/utils/constants";
import api from "@/lib/axios";

export const RegisterSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!userId) {
      navigate("/auth/register");
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (cooldownRemaining === null || cooldownRemaining <= 0) return;

    const timer = setTimeout(() => {
      setCooldownRemaining((prev) =>
        prev !== null && prev > 1 ? prev - 1 : null
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldownRemaining]);

  const handleResendVerification = async () => {
    if (!userId) return;

    setIsResending(true);
    try {
      await api.post(`/auth/resend-verify-email`, { ID: userId });

      toast({
        title: "Đã gửi lại email",
        description: "Vui lòng kiểm tra hộp thư của bạn.",
      });

      setCooldownRemaining(60);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gửi lại thất bại",
        description: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate(AUTH_LOGIN_ENDPOINT);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Đăng ký thành công!</CardTitle>
          <CardDescription className="text-base">
            Tài khoản của bạn đã được tạo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="mb-1 font-medium text-foreground">
                  Kiểm tra email của bạn
                </p>
                <p className="text-muted-foreground">
                  Chúng tôi đã gửi một email xác thực đến địa chỉ email của bạn.
                  Vui lòng nhấp vào liên kết trong email để kích hoạt tài khoản.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>📧 Không thấy email?</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Kiểm tra thư mục spam/junk</li>
              <li>Đảm bảo địa chỉ email chính xác</li>
              <li>Đợi vài phút rồi làm mới hộp thư</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handleResendVerification}
            variant="outline"
            className="w-full"
            disabled={isResending || cooldownRemaining !== null}
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin text-primary" />
                Đang gửi...
              </>
            ) : cooldownRemaining !== null ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 text-primary" />
                Gửi lại sau {cooldownRemaining}s
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4 text-primary" />
                Gửi lại email xác thực
              </>
            )}
          </Button>

          <Button
            onClick={handleGoToLogin}
            variant="default"
            className="h-11 w-full rounded-full font-semibold shadow-md hover:shadow-lg"
          >
            Đã xác thực? Đăng nhập ngay
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
