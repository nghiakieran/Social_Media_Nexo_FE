import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditProfileForm } from '../components/EditProfileForm';
import { useNavigate } from 'react-router-dom';

export const EditProfilePage = () => {
  const navigate = useNavigate();

  const handleSave = (data: any) => {
    // In a real app, this would save to backend
    console.log('Saving profile data:', data);
    navigate('/nghialc81');
  };

  const handleCancel = () => {
    navigate('/nghialc81');
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