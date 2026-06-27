import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditProfileForm } from '../components/EditProfileForm';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import type { UserProfile } from '../types';

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);

  const handleSave = (data: UserProfile) => {
    // Navigate về profile của user hiện tại
    if (currentUser?.username) {
      navigate(`/${currentUser.username}`);
    } else {
      navigate('/');
    }
  };

  const handleCancel = () => {
    // Navigate về profile của user hiện tại
    if (currentUser?.username) {
      navigate(`/${currentUser.username}`);
    } else {
      navigate('/');
    }
  };

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
            Chỉnh sửa trang cá nhân
          </h1>
        </div>
      </div>

      {/* Content */}
      <EditProfileForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};