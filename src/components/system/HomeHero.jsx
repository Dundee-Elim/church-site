// @ts-nocheck
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveMediaSrc } from '@/lib/siteContentUtils';
import { cn } from '@/lib/utils';
import PageShell from './PageShell';

function HeroSlideshow({ slides }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setCurrent((index) => (index + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [slides]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const slide = slides[current];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.img
          key={`${slide.caption || 'slide'}-${current}`}
          src={resolveMediaSrc(slide.image)}
          alt={slide.image?.alt || slide.caption || ''}
          // Crop toward the upper-centre so faces/busy foreground are not
          // covered by the headline that sits in the lower half.
          className="absolute inset-0 h-full w-full object-cover object-[center_32%]"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.42, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </AnimatePresence>
    </div>
  );
}

/**
 * Home page hero. Slideshow background with a strong bottom overlay so
 * the headline + CTAs read clearly while keeping a warm, welcoming feel.
 */
export default function HomeHero({
  slides = [],
  eyebrow = null,
  titleLead = null,
  titleHighlight = null,
  description = null,
  primaryCta = null,
  secondaryCta = null,
  scrollLabel = null,
  className = undefined,
}) {
  return (
    <section
      className={cn('relative flex items-center justify-center overflow-hidden', className)}
      style={{ minHeight: 'var(--ds-hero-home)', paddingTop: 'calc(var(--ds-navbar-h) + 2rem)' }}
    >
      <HeroSlideshow slides={slides} />

      {/* Layered overlay: stronger at the bottom for text legibility. */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(circle at 50% 8%, rgba(96,165,250,0.16), transparent 42%), linear-gradient(180deg, rgba(4,8,18,0.55) 0%, rgba(4,8,18,0.32) 38%, rgba(4,8,18,0.82) 82%, rgba(3,8,16,0.96) 100%)',
        }}
      />

      <PageShell className="relative z-10 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {eyebrow ? (
            <span className="ds-navbar--top inline-flex items-center rounded-full px-5 py-2 text-ds-label font-semibold uppercase tracking-[0.24em] text-blue-100">
              {eyebrow}
            </span>
          ) : null}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-[16ch] font-display text-ds-hero font-bold text-white"
        >
          {titleLead}
          {titleHighlight ? (
            <>
              <br />
              <span className="text-gradient">{titleHighlight}</span>
            </>
          ) : null}
        </motion.h1>

        {description ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="mx-auto mt-6 max-w-text text-ds-body text-white/80 sm:text-lg"
          >
            {description}
          </motion.p>
        ) : null}

        {(primaryCta || secondaryCta) ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.34 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            {primaryCta}
            {secondaryCta}
          </motion.div>
        ) : null}
      </PageShell>

      {scrollLabel ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1"
        >
          <span className="h-9 w-px bg-gradient-to-b from-white/0 to-white/40" />
          <span className="text-[0.66rem] uppercase tracking-[0.24em] text-white/55">{scrollLabel}</span>
        </motion.div>
      ) : null}
    </section>
  );
}
