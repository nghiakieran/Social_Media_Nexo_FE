import { useState, useEffect } from 'react';

interface CountdownProps {
  initialSeconds: number;
  onComplete?: () => void;
  onReset?: () => void;
  className?: string;
  showResetButton?: boolean;
  resetButtonText?: string;
  format?: 'mm:ss' | 'ss';
}

export const Countdown = ({
  initialSeconds,
  onComplete,
  onReset,
  className = '',
  showResetButton = true,
  resetButtonText = 'Gửi lại',
  format = 'mm:ss'
}: CountdownProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => {
          if (seconds <= 1) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, seconds, onComplete]);

  const handleReset = () => {
    setSeconds(initialSeconds);
    setIsActive(true);
    onReset?.();
  };

  const formatTime = (totalSeconds: number) => {
    if (format === 'ss') {
      return `${totalSeconds}s`;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isActive && seconds > 0 ? (
        <span className="text-sm text-muted-foreground">
          Gửi lại sau {formatTime(seconds)}
        </span>
      ) : (
        showResetButton && (
          <button
            onClick={handleReset}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {resetButtonText}
          </button>
        )
      )}
    </div>
  );
};
