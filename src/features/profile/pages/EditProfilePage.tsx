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
            <h1 className="text-lg font-semibold">Chỉnh sửa trang cá nhân</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <EditProfileForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};