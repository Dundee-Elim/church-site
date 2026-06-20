// @ts-nocheck
import { motion } from 'framer-motion';
import { cardHover } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * The single, consistent glass card used across the public site.
 * - variant "default" → 24px radius
 * - variant "feature" → 32px radius, slightly stronger surface
 * Set `interactive` for a subtle lift/hover (used for clickable cards).
 */
export default function GlassCard({
  as: Tag = 'div',
  variant = 'default',
  interactive = false,
  className = undefined,
  children = null,
  ...props
}) {
  const classes = cn(
    'ds-card',
    variant === 'feature' && 'ds-card--feature',
    interactive && 'ds-card--interactive',
    className,
  );

  if (interactive) {
    const MotionTag = motion[Tag] || motion.div;
    return (
      <MotionTag className={classes} {...cardHover} {...props}>
        {children}
      </MotionTag>
    );
  }

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
