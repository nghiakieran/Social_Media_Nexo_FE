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
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate("/auth/register");
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (cooldownRemaining === null || cooldownRemaining <= 0) return;

    const timer = setTimeout(() => {
      setCooldownRemaining((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
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
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Kiểm tra email của bạn
                </p>
                <p className="text-blue-700 dark:text-blue-300">
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
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : cooldownRemaining !== null ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Gửi lại sau {cooldownRemaining}s
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Gửi lại email xác thực
              </>
            )}
          </Button>

          <Button
            onClick={handleGoToLogin}
            variant="default"
            className="w-full"
          >
            Đã xác thực? Đăng nhập ngay
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
