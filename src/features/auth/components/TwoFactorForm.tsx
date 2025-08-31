import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { mockAuthDelay } from '../__mocks__/users';

export const TwoFactorForm = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = location.state?.email || 'demo@instagram.com';

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const enteredCode = code.join('');
    if (enteredCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Mã không hợp lệ",
        description: "Vui lòng nhập đầy đủ 6 số.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await mockAuthDelay();
      
      // Mock 2FA validation (accept 123456 as valid code)
      if (enteredCode === '123456') {
        toast({
          title: "Xác thực thành công!",
          description: "Bạn đã đăng nhập thành công.",
        });
        navigate('/');
      } else {
        toast({
          variant: "destructive",
          title: "Mã không chính xác",
          description: "Vui lòng kiểm tra lại mã xác thực.",
        });
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      await mockAuthDelay();
      toast({
        title: "Đã gửi lại mã",
        description: "Kiểm tra ứng dụng xác thực của bạn.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi lại mã. Vui lòng thử lại.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-instagram bg-clip-text text-transparent mb-2">
          Xác thực 2 bước
        </h1>
        <p className="text-muted-foreground mb-4">
          Nhập mã 6 số từ ứng dụng xác thực của bạn
        </p>
        <p className="text-sm text-muted-foreground">
          Được gửi đến: {email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div className="flex gap-2 justify-center">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold"
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Hint */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Demo: Nhập <code className="bg-muted px-1 rounded">123456</code> để xác thực
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="instagram"
          className="w-full h-11"
          disabled={isLoading || code.join('').length !== 6}
        >
          {isLoading ? 'Đang xác thực...' : 'Xác thực'}
        </Button>

        {/* Resend Code */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {isResending ? 'Đang gửi...' : 'Gửi lại mã'}
          </button>
        </div>
      </form>

      {/* Back to Login */}
      <div className="text-center mt-6 pt-6 border-t border-border">
        <button
          onClick={() => navigate('/auth/login')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
};