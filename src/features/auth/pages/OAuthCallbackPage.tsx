import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { oauthLoginAsync } from "../authSlice";
import { Loader } from "@/components/common/Loader";
import { useToast } from "@/hooks/use-toast";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/utils/constants";
import { hasAdminRole } from "@/lib/utils";

export const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("OAuth error:", error);
        navigate("/auth/login?error=oauth_failed");
        return;
      }

      if (!code) {
        console.error("No authorization code received");
        navigate("/auth/login?error=no_code");
        return;
      }

      try {
        const result = await dispatch(oauthLoginAsync(code)).unwrap();

        if (
          typeof result === "object" &&
          "missing_info" in result &&
          result.missing_info
        ) {
          navigate(`/auth/oauth/complete-profile?token=${result.temp_token}`);
          return;
        }

        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng trở lại!",
        });
        
        // Check if user has ADMIN role and redirect accordingly
        const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
        if (hasAdminRole(accessToken)) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("OAuth login failed:", error);
        navigate("/auth/login?error=oauth_login_failed");
      }
    };

    handleOAuthCallback();
  }, [searchParams, dispatch, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader />
        <p className="mt-4 text-muted-foreground">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};
