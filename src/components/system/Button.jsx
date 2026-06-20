// @ts-nocheck
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { subtleTap } from '@/lib/motion';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'lg-btn-primary',
  ghost: 'lg-btn-ghost',
  soft: 'glass-action-soft',
  danger: 'glass-action-danger',
};

const SIZES = {
  // All sizes keep a >= 44px tap target via control-height tokens.
  sm: 'min-h-[2.75rem] px-4 text-sm',
  md: 'px-5 text-sm sm:text-base',
  lg: 'px-7 text-base sm:text-lg',
};

/**
 * Unified button / link. Renders a router <Link> when `to` is set,
 * an <a> when `href` is set, otherwise a <button>.
 */
export default function Button({
  as = undefined,
  to = undefined,
  href = undefined,
  variant = 'primary',
  size = 'md',
  className = undefined,
  children = null,
  animate = true,
  ...props
}) {
  const classes = cn(
    'focus-ring inline-flex items-center justify-center gap-2 font-semibold',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className,
  );

  let element;
  if (to) {
    element = (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  } else if (href) {
    element = (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  } else {
    const Component = as || 'button';
    element = (
      <Component className={classes} {...props}>
        {children}
      </Component>
    );
  }

  if (!animate) {
    return element;
  }

  return (
    <motion.span className="inline-flex" {...subtleTap}>
      {element}
    </motion.span>
  );
}
