import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountSettings } from '../components/AccountSettings';
import { useNavigate } from 'react-router-dom';

export const AccountSettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 lg:top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-center px-4 py-3 relative min-h-[48px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground text-center">
            Cài đặt tài khoản
          </h1>
        </div>
      </div>

      {/* Content */}
      <AccountSettings />
    </div>
  );
};