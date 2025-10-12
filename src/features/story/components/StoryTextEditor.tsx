import { useState } from "react";
import { X, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryTextEditorProps {
  onClose: () => void;
  onSave: (text: string, style: TextStyle) => void;
}

interface TextStyle {
  color: string;
  backgroundColor: string;
  size: "small" | "medium" | "large";
}

const TEXT_COLORS = [
  "#FFFFFF", // White
  "#000000", // Black
  "#FF6B6B", // Red
  "#4ECDC4", // Cyan
  "#45B7D1", // Blue
  "#FFA07A", // Orange
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Light Blue
  "#FF1493", // Deep Pink
  "#32CD32", // Lime Green
  "#FF69B4", // Hot Pink
  "#00CED1", // Dark Turquoise
  "#FFD700", // Gold
  "#FF4500", // Orange Red
  "#9370DB", // Medium Purple
  "#00FA9A", // Medium Spring Green
  "#FF6347", // Tomato
  "#1E90FF", // Dodger Blue
];

export const StoryTextEditor = ({ onClose, onSave }: StoryTextEditorProps) => {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#FFFFFF");
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");

  const handleSave = () => {
    if (text.trim()) {
      onSave(text, {
        color,
        backgroundColor: "transparent",
        size,
      });
      onClose();
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "text-2xl";
      case "medium":
        return "text-4xl";
      case "large":
        return "text-6xl";
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-semibold">Thêm văn bản</h2>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!text.trim()}
        >
          Xong
        </button>
      </div>

      {/* Text Input Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập văn bản..."
            className={cn(
              "w-full bg-transparent resize-none outline-none font-bold text-center",
              getSizeClass()
            )}
            style={{
              color,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
            rows={3}
            autoFocus
          />
        </div>
      </div>

      {/* Tools */}
      <div className="p-4 space-y-4">
        {/* Color Picker */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-2 overflow-x-auto pb-2 px-2">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex-shrink-0 transition-transform",
                  color === c ? "border-white scale-110" : "border-white/30"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Text Size */}
        <div className="flex items-center justify-center">
          <div className="flex gap-2 bg-white/20 rounded-full p-1">
            <button
              onClick={() => setSize("small")}
              className={cn(
                "px-6 py-2 rounded-full text-white text-sm transition-colors",
                size === "small" && "bg-white/30"
              )}
            >
              Nhỏ
            </button>
            <button
              onClick={() => setSize("medium")}
              className={cn(
                "px-6 py-2 rounded-full text-white text-sm transition-colors",
                size === "medium" && "bg-white/30"
              )}
            >
              Vừa
            </button>
            <button
              onClick={() => setSize("large")}
              className={cn(
                "px-6 py-2 rounded-full text-white text-sm transition-colors",
                size === "large" && "bg-white/30"
              )}
            >
              Lớn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
