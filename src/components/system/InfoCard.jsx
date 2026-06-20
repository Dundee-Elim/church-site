// @ts-nocheck
import { cn } from '@/lib/utils';
import GlassCard from './GlassCard';

/**
 * Compact horizontal info card: icon badge + label + value.
 * Used for quick-info rows (service time, location, contact).
 */
export default function InfoCard({ icon: Icon = null, label = null, value = null, className = undefined, ...props }) {
  return (
    <GlassCard className={cn('flex min-w-0 items-center gap-4', className)} {...props}>
      {Icon ? (
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-ds-inner border border-white/10 bg-blue-400/12 text-blue-200">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      ) : null}
      <div className="min-w-0">
        {label ? (
          <p className="text-ds-label font-semibold uppercase tracking-[0.22em] text-blue-200/80">{label}</p>
        ) : null}
        {value ? <p className="mt-1 break-words text-ds-body font-medium text-white">{value}</p> : null}
      </div>
    </GlassCard>
  );
}
