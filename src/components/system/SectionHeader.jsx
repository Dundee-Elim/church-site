// @ts-nocheck
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Eyebrow + title + supporting copy block used at the top of sections.
 */
export default function SectionHeader({
  eyebrow = null,
  title = null,
  description = null,
  align = 'center',
  className = undefined,
  titleClassName = undefined,
  children = null,
}) {
  const alignment = align === 'left' ? 'text-left' : 'text-center mx-auto';

  return (
    <motion.div
      {...fadeUp}
      className={cn('max-w-text', align === 'center' && 'mx-auto', alignment, className)}
    >
      {eyebrow ? <p className="ds-eyebrow">{eyebrow}</p> : null}
      {title ? <h2 className={cn('ds-section-title', titleClassName)}>{title}</h2> : null}
      {description ? <p className="ds-section-copy">{description}</p> : null}
      {children}
    </motion.div>
  );
}
