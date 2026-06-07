import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  overlay?: boolean;
}

export const Loader = ({ className, overlay = false }: LoaderProps) => {
  const loaderElement = (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
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