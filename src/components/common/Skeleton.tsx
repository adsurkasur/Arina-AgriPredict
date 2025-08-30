import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className = "", 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = "skeleton bg-muted";
  
  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

// Skeleton components for specific use cases
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton width={80} height={20} />
          <Skeleton width={120} height={20} />
          <Skeleton width={100} height={20} />
          <Skeleton width={80} height={20} />
          <Skeleton width={80} height={20} />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height={200} className="w-full" />
      <div className="flex justify-center space-x-4">
        <Skeleton width={60} height={12} />
        <Skeleton width={80} height={12} />
        <Skeleton width={70} height={12} />
      </div>
    </div>
  );
}