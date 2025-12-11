import { Lock } from 'lucide-react';

interface PrivateAccountMessageProps {
  profileName: string;
}

export const PrivateAccountMessage = ({ profileName }: PrivateAccountMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
      </div>
      
      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-semibold">Đây là tài khoản riêng tư</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Hãy theo dõi để xem ảnh và video của {profileName}.
        </p>
      </div>
    </div>
  );
};
