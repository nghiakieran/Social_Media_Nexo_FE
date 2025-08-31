import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { mockAuthDelay } from '../__mocks__/users';

interface ForgotPasswordFormData {
  contact: string;
  method: 'email' | 'sms';
}

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    defaultValues: { method: 'email' },
  });

  const watchedMethod = watch('method');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      await mockAuthDelay();
      
      setIsSuccess(true);
      toast({
        title: "Đã gửi link khôi phục",
        description: `Link khôi phục mật khẩu đã được gửi đến ${data.contact}`,
      });
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

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Kiểm tra email của bạn</h1>
          <p className="text-muted-foreground">
            Chúng tôi đã gửi link khôi phục mật khẩu đến email của bạn. 
            Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
          </p>
        </div>

        <div className="space-y-4">
          <Button variant="instagram" className="w-full" asChild>
            <Link to="/auth/login">Quay lại đăng nhập</Link>
          </Button>
          
          <button
            onClick={() => setIsSuccess(false)}
            className="text-sm text-primary hover:underline"
          >
            Không nhận được email? Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-instagram bg-clip-text text-transparent mb-2">
          Quên mật khẩu?
        </h1>
        <p className="text-muted-foreground">
          Nhập email hoặc số điện thoại để khôi phục mật khẩu
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Recovery Method */}
        <div className="space-y-3">
          <Label>Phương thức khôi phục</Label>
          <RadioGroup 
            value={method} 
            onValueChange={(value) => setMethod(value as 'email' | 'sms')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                <Mail className="w-4 h-4" />
                Email
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sms" id="sms" />
              <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                <Phone className="w-4 h-4" />
                SMS
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Contact Input */}
        <div className="space-y-2">
          <Label htmlFor="contact">
            {method === 'email' ? 'Địa chỉ email' : 'Số điện thoại'}
          </Label>
          <div className="relative">
            {method === 'email' ? (
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            ) : (
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <Input
              id="contact"
              type={method === 'email' ? 'email' : 'tel'}
              placeholder={method === 'email' ? 'your@email.com' : '+84 123 456 789'}
              className="pl-10"
              {...register('contact', {
                required: `${method === 'email' ? 'Email' : 'Số điện thoại'} là bắt buộc`,
                ...(method === 'email' && {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ',
                  },
                }),
                ...(method === 'sms' && {
                  pattern: {
                    value: /^[+]?[0-9\s\-\(\)]{10,}$/,
                    message: 'Số điện thoại không hợp lệ',
                  },
                }),
              })}
            />
          </div>
          {errors.contact && (
            <p className="text-sm text-destructive">{errors.contact.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="instagram"
          className="w-full h-11"
          disabled={isLoading}
        >
          {isLoading ? 'Đang gửi...' : 'Gửi link khôi phục'}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center mt-6 pt-6 border-t border-border">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};