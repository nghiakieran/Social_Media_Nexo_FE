import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  overlay?: boolean;
}

export const Loader = ({ className, overlay = false }: LoaderProps) => {
  const loaderElement = (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-accent rounded-full animate-spin animation-delay-200"></div>
      </div>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
};