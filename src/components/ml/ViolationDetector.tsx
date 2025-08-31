import { useState } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ViolationDetectorProps {
  content: {
    type: 'image' | 'video' | 'text';
    url?: string;
    text?: string;
  };
  violationScore?: number; // 0-1, higher = more likely violation
  violationType?: string;
  className?: string;
}

export const ViolationDetector = ({ 
  content, 
  violationScore = 0,
  violationType,
  className 
}: ViolationDetectorProps) => {
  const [showContent, setShowContent] = useState(violationScore < 0.7);
  
  const isHighRisk = violationScore >= 0.7;
  const isMediumRisk = violationScore >= 0.4 && violationScore < 0.7;
  
  if (violationScore < 0.3) {
    // No violation detected, show content normally
    return (
      <div className={className}>
        {content.type === 'image' && content.url && (
          <img src={content.url} alt="Content" className="w-full h-auto rounded-lg" />
        )}
        {content.type === 'text' && content.text && (
          <p>{content.text}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Content */}
      <div className={`${!showContent ? 'blur-md' : ''} transition-all duration-300`}>
        {content.type === 'image' && content.url && (
          <img src={content.url} alt="Content" className="w-full h-auto rounded-lg" />
        )}
        {content.type === 'text' && content.text && (
          <p>{content.text}</p>
        )}
      </div>

      {/* Violation Overlay */}
      {(isHighRisk || isMediumRisk) && (
        <>
          {isHighRisk && <div className="violation-overlay" />}
          
          {/* Violation Badge */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="destructive" 
                  className={`violation-badge ${isMediumRisk ? 'bg-warning' : ''}`}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {isHighRisk ? 'Vi phạm' : 'Cảnh báo'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-medium">
                    {isHighRisk ? 'Nội dung có thể vi phạm chính sách' : 'Nội dung cần xem xét'}
                  </p>
                  {violationType && (
                    <p className="text-sm mt-1">Loại: {violationType}</p>
                  )}
                  <p className="text-sm mt-1">
                    Độ tin cậy: {Math.round(violationScore * 100)}%
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Show/Hide Button for high risk content */}
          {isHighRisk && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 left-2"
              onClick={() => setShowContent(!showContent)}
            >
              {showContent ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ẩn
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Xem
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
};