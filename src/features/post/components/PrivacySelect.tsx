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
            <div className="flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 transition-colors hover:bg-primary/10">
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
      <SelectContent className="w-64 p-1.5 bg-card border border-border/50 text-card-foreground shadow-xl rounded-2xl">
        {privacyOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            hideIcon
            className="rounded-xl p-2.5 my-1 hover:cursor-pointer focus:bg-muted/60 data-[state=checked]:bg-primary/10 border border-transparent data-[state=checked]:border-primary/20 [&>span]:w-full [&>span>span]:hidden"
          >
            <div className="flex items-center gap-3 w-full">
              <div
                className={`p-2 rounded-lg bg-muted/60 ${getIconColor(
                  option.value
                )}`}
              >
                <option.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col flex-1 text-left">
                <span className="font-semibold text-sm text-foreground">
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </span>
              </div>
              {value === option.value && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/30"></div>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
