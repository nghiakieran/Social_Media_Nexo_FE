import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { User, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/store";
import { hydrateAuthAsync } from "@/features/auth/authSlice";
import { Loader } from "@/components/common/Loader";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  BEARER_TOKEN_PREFIX,
} from "@/utils/constants";
import { api } from "@/lib/axios";
import { hasAdminRole } from "@/lib/utils";

interface CompleteProfileFormData {
  username: string;
  fullname: string;
}

export const OAuthCompleteProfileForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteProfileFormData>();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      navigate("/auth/login");
    }
  }, [searchParams, navigate]);

  const onSubmit = async (data: CompleteProfileFormData) => {
    setIsLoading(true);
    try {
      const token = searchParams.get("token");
      if (!token) {
        throw new Error("Missing OAuth token");
      }

      await api.put(
        "/users",
        {
          username: data.username,
          fullName: data.fullname,
        },
        {
          headers: {
            Authorization: `${BEARER_TOKEN_PREFIX} ${token}`,
          },
        }
      );

      // Store the token and authenticate the user
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
      await dispatch(hydrateAuthAsync()).unwrap();

      toast({
        title: "Hoàn thành hồ sơ",
        description: "Tài khoản của bạn đã được cập nhật thành công!",
      });

      // Check if user has ADMIN role and redirect accordingly
      const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (hasAdminRole(accessToken)) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          err.message || "Không thể hoàn thành hồ sơ. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-foreground">Nexo</span>{" "}
          <span className="text-primary">Social</span>
        </h1>
        <p className="text-muted-foreground">Hoàn thành hồ sơ của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Tên người dùng</Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
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
                  message:
                    "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới",
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

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullname">Họ và tên</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullname"
              type="text"
              placeholder="Nguyen Van A"
              className="pl-10"
              {...register("fullname", {
                required: "Họ và tên là bắt buộc",
                minLength: {
                  value: 2,
                  message: "Họ và tên phải có ít nhất 2 ký tự",
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

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          className="h-11 w-full rounded-full font-semibold shadow-md hover:shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? "Đang hoàn thành..." : "Hoàn thành"}
        </Button>
      </form>
    </div>
  );
};
