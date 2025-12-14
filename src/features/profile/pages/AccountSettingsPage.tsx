import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountSettings } from '../components/AccountSettings';
import { useNavigate } from 'react-router-dom';

export const AccountSettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">Cài đặt tài khoản</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <AccountSettings />
    </div>
  );
};