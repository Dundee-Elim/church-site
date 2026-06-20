// @ts-nocheck
import { cn } from '@/lib/utils';
import PageShell from './PageShell';

const SPACING = {
  default: 'ds-section',
  compact: 'ds-section--compact',
  spacious: 'ds-section--spacious',
};

/**
 * Vertical-rhythm section wrapper. Combines consistent block padding
 * with a PageShell for horizontal width control.
 */
export default function Section({
  as: Tag = 'section',
  spacing = 'default',
  width = 'page',
  className = undefined,
  innerClassName = undefined,
  children = null,
  ...props
}) {
  return (
    <Tag className={cn(SPACING[spacing] || SPACING.default, className)} {...props}>
      <PageShell width={width} className={innerClassName}>
        {children}
      </PageShell>
    </Tag>
  );
}
