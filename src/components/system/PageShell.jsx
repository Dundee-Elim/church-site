// @ts-nocheck
import { cn } from '@/lib/utils';

const WIDTHS = {
  page: 'ds-shell',
  feature: 'ds-shell-feature',
  text: 'ds-shell-text',
};

/**
 * Horizontal container that enforces the design-system max widths
 * (page 1120 / feature 960 / text 720) and responsive gutters.
 */
export default function PageShell({ width = 'page', className = undefined, children = null, ...props }) {
  return (
    <div className={cn(WIDTHS[width] || WIDTHS.page, className)} {...props}>
      {children}
    </div>
  );
}
