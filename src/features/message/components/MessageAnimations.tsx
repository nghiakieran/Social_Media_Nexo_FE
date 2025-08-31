import React from 'react';
import { cn } from '@/lib/utils';

interface MessageAnimationWrapperProps {
  children: React.ReactNode;
  isOwn: boolean;
  delay?: number;
  className?: string;
}

export const MessageAnimationWrapper: React.FC<MessageAnimationWrapperProps> = ({
  children,
  isOwn,
  delay = 0,
  className,
}) => {
  return (
    <div
      className={cn(
        'animate-slide-in-from-bottom',
        isOwn ? 'slide-in-right' : 'slide-in-left',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface TypingDotsProps {
  className?: string;
}

export const TypingDots: React.FC<TypingDotsProps> = ({ className }) => {
  return (
    <div className={cn('flex space-x-1 py-2', className)}>
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};

interface MessageSlideInProps {
  children: React.ReactNode;
  direction: 'left' | 'right';
  delay?: number;
}

export const MessageSlideIn: React.FC<MessageSlideInProps> = ({
  children,
  direction,
  delay = 0,
}) => {
  return (
    <div
      className={cn(
        'animate-slide-in-from-bottom',
        direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};