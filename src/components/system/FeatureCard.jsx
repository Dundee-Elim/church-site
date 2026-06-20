// @ts-nocheck
import { cn } from '@/lib/utils';
import GlassCard from './GlassCard';

/**
 * Icon + title + body card. Used for "what to expect", beliefs,
 * ministries summaries, etc. Single restrained accent colour for the
 * icon badge (no rainbow of per-card colours).
 */
export default function FeatureCard({
  icon: Icon = null,
  title = null,
  children = null,
  className = undefined,
  interactive = true,
  ...props
}) {
  return (
    <GlassCard interactive={interactive} className={cn('flex flex-col gap-4', className)} {...props}>
      {Icon ? (
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-ds-inner border border-white/10 bg-blue-400/12 text-blue-200">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      ) : null}
      {title ? <h3 className="font-display text-ds-card font-bold text-white">{title}</h3> : null}
      {children ? <div className="text-ds-body text-white/70">{children}</div> : null}
    </GlassCard>
  );
}
