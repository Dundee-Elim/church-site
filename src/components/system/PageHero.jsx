// @ts-nocheck
import { motion } from 'framer-motion';
import { resolveMediaSrc } from '@/lib/siteContentUtils';
import { cn } from '@/lib/utils';
import PageShell from './PageShell';

/**
 * Compact interior-page hero (≈380px desktop / 300px mobile).
 * Optional background image is heavily darkened for text legibility.
 */
export default function PageHero({ eyebrow = null, title = null, description = null, image = null, className = undefined, children = null }) {
  return (
    <header
      className={cn('relative flex items-end overflow-hidden', className)}
      style={{ minHeight: 'var(--ds-hero-page)', paddingTop: 'calc(var(--ds-navbar-h) + 1.5rem)' }}
    >
      {image ? (
        <div className="absolute inset-0 z-0">
          <img
            src={resolveMediaSrc(image)}
            alt={image.alt || ''}
            className="h-full w-full object-cover object-[center_35%]"
          />
        </div>
      ) : null}

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(96,165,250,0.14), transparent 45%), linear-gradient(180deg, rgba(4,8,18,0.72) 0%, rgba(4,8,18,0.6) 45%, rgba(4,8,18,0.94) 100%)',
        }}
      />

      <PageShell className="relative z-10 pb-12 pt-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-feature"
        >
          {eyebrow ? <p className="ds-eyebrow">{eyebrow}</p> : null}
          {title ? (
            <h1 className="mt-3 font-display text-ds-page-title font-bold text-white">{title}</h1>
          ) : null}
          {description ? (
            <p className="mx-auto mt-4 max-w-text text-ds-body text-white/75">{description}</p>
          ) : null}
          {children}
        </motion.div>
      </PageShell>
    </header>
  );
}
