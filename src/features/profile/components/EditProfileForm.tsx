import { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfileAsync, fetchCurrentUserProfileAsync } from '../profileSlice';
import type { UpdateProfileRequest, UserProfile } from '../types';

interface EditProfileFormProps {
  onSave: (data: UserProfile) => void;
  onCancel: () => void;
}

export const EditProfileForm = ({ onSave, onCancel }: EditProfileFormProps) => {
  const dispatch = useAppDispatch();
  const { currentProfile, isLoading } = useAppSelector((state) => state.profile);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: currentProfile?.username || '',
    fullName: currentProfile?.name || '',
    bio: currentProfile?.bio || '',
    avatar: currentProfile?.avatar || '',
    isPrivate: currentProfile?.isPrivate || false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch current user profile when component mounts
  useEffect(() => {
    if (!currentProfile) {
      dispatch(fetchCurrentUserProfileAsync());
    }
  }, [dispatch, currentProfile]);

  // Update form data when currentProfile changes
  useEffect(() => {
    if (currentProfile) {
      setFormData({
        username: currentProfile.username || '',
        fullName: currentProfile.name || '',
        bio: currentProfile.bio || '',
        avatar: currentProfile.avatar || '',
        isPrivate: currentProfile.isPrivate || false,
      });
    }
  }, [currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: UpdateProfileRequest = {
        username: formData.username,
        fullName: formData.fullName,
        bio: formData.bio,
        isPrivate: formData.isPrivate,
        avatar: selectedFile || formData.avatar,
      };

      const result = await dispatch(updateUserProfileAsync(updateData)).unwrap();
      
      onSave(result);
      toast({
        variant: 'success',
        title: 'Đã cập nhật hồ sơ',
        description: 'Thông tin hồ sơ của bạn đã được lưu thành công.',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật hồ sơ. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatar: url }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa trang cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.avatar} alt="Avatar" />
                  <AvatarFallback>
                    {formData.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="font-semibold">{formData.username}</h3>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => {
                    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  Thay đổi ảnh đại diện
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Tên</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Tên của bạn"
              />
              <p className="text-xs text-muted-foreground">
                Tên sẽ hiển thị trên hồ sơ của bạn
              </p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Tên người dùng</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Tên người dùng"
              />
              <p className="text-xs text-muted-foreground">
                Tên người dùng chỉ có thể chứa chữ cái, số, dấu gạch dưới và dấu chấm
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Tiểu sử</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Giới thiệu về bản thân..."
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/150 ký tự
              </p>
            </div>

            {/* Private Account */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="private-account" className="font-medium">
                  Tài khoản riêng tư
                </Label>
                <p className="text-sm text-muted-foreground">
                  Chỉ những người theo dõi bạn mới có thể xem ảnh và video của bạn
                </p>
              </div>
              <Switch
                id="private-account"
                checked={formData.isPrivate}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isPrivate: checked }))
                }
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="default"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};