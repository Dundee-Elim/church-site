// @ts-nocheck
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/utils';
import PageShell from './PageShell';

/**
 * Closing call-to-action band: title, supporting copy and one or two
 * buttons inside a feature glass card.
 */
export default function CTASection({ eyebrow = null, title = null, description = null, actions = null, className = undefined }) {
  return (
    <section className={cn('ds-section', className)}>
      <PageShell width="feature">
        <motion.div
          {...fadeUp}
          className="ds-card ds-card--feature flex flex-col items-center gap-5 text-center"
        >
          {eyebrow ? <p className="ds-eyebrow">{eyebrow}</p> : null}
          {title ? <h2 className="ds-section-title">{title}</h2> : null}
          {description ? <p className="max-w-text text-ds-body text-white/72">{description}</p> : null}
          {actions ? (
            <div className="mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {actions}
            </div>
          ) : null}
        </motion.div>
      </PageShell>
    </section>
  );
}
