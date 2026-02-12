import { cn } from '../LayoutHelpers';

/**
 * Skeleton loading component with shape variants
 * Animated pulse effect for loading states
 */

export type SkeletonShape = 'text' | 'circle' | 'rectangle';

export interface SkeletonProps {
  shape?: SkeletonShape;
  className?: string;
  count?: number;
}

const shapeStyles: Record<SkeletonShape, string> = {
  text: 'h-4 w-full rounded',
  circle: 'rounded-full',
  rectangle: 'rounded-lg',
};

const Skeleton = ({ shape = 'text', className, count = 1 }: SkeletonProps) => {

  const skeletonElement = (
    <div className={cn('skeleton bg-surface animate-pulse', shapeStyles[shape], className)} aria-hidden="true" />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{skeletonElement}</div>
      ))}
    </div>
  );
};

export default Skeleton;
