import { Globe, Users, Lock } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PrivacyOption {
  value: 'public' | 'friends' | 'private';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface PrivacySelectProps {
  value: string;
  onChange: (value: 'public' | 'friends' | 'private') => void;
  className?: string;
}

const privacyOptions: PrivacyOption[] = [
  {
    value: 'public',
    label: 'Công khai',
    icon: Globe,
    description: 'Mọi người đều có thể xem',
  },
  {
    value: 'friends',
    label: 'Bạn bè',
    icon: Users,
    description: 'Chỉ bạn bè có thể xem',
  },
  {
    value: 'private',
    label: 'Chỉ mình tôi',
    icon: Lock,
    description: 'Chỉ bạn có thể xem',
  },
];

export const PrivacySelect = ({ value, onChange, className }: PrivacySelectProps) => {
  const selectedOption = privacyOptions.find(option => option.value === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue>
          {selectedOption && (
            <div className="flex items-center gap-2">
              <selectedOption.icon className="w-4 h-4" />
              <span>{selectedOption.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {privacyOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-start gap-3 py-1">
              <option.icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-sm text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};