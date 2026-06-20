// @ts-nocheck
import { cn } from '@/lib/utils';

const COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const GAPS = {
  sm: 'gap-4',
  md: 'gap-5 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
};

/**
 * Responsive card grid with consistent breakpoints and gaps.
 */
export default function ResponsiveGrid({ cols = 3, gap = 'md', className = undefined, children = null, ...props }) {
  return (
    <div className={cn('grid', COLS[cols] || COLS[3], GAPS[gap] || GAPS.md, className)} {...props}>
      {children}
    </div>
  );
}
