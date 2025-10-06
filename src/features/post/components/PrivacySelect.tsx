import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Lock } from "lucide-react";

interface PrivacyOption {
  value: "public" | "friends" | "private";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface PrivacySelectProps {
  value: string;
  onChange: (value: "public" | "friends" | "private") => void;
  className?: string;
}

const privacyOptions: PrivacyOption[] = [
  {
    value: "public",
    label: "Công khai",
    icon: Globe,
    description: "Mọi người đều có thể xem",
  },
  {
    value: "private",
    label: "Chỉ mình tôi",
    icon: Lock,
    description: "Chỉ bạn có thể xem",
  },
];

export const PrivacySelect = ({
  value,
  onChange,
  className,
}: PrivacySelectProps) => {
  const selectedOption = privacyOptions.find(
    (option) => option.value === value
  );

  const getIconColor = (optionValue: string) => {
    switch (optionValue) {
      case "public":
        return "text-green-500";
      case "private":
        return "text-orange-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={`w-full border-0 bg-transparent p-0 h-auto hover:bg-transparent focus:ring-0 ${className}`}
      >
        <SelectValue>
          {selectedOption && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 hover:bg-muted transition-colors">
              <selectedOption.icon
                className={`w-4 h-4 ${getIconColor(selectedOption.value)}`}
              />
              <span className="text-sm font-medium">
                {selectedOption.label}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-64 p-2">
        {privacyOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="p-3 rounded-xl [&>span>span]:hidden hover:cursor-pointer focus:bg-accent/85"
          >
            <div className="flex items-center gap-3 w-full">
              <div
                className={`p-2 rounded-lg bg-muted/50 ${getIconColor(
                  option.value
                )}`}
              >
                <option.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-medium text-sm">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </div>
              {value === option.value && (
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
