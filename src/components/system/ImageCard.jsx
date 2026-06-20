// @ts-nocheck
import { cn } from '@/lib/utils';

const RATIOS = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/10]',
};

/**
 * Image inside a fixed aspect-ratio frame with a contained hover zoom.
 * Optional overlay content (e.g. a caption) renders above the image.
 */
export default function ImageCard({
  src = null,
  alt = '',
  ratio = 'landscape',
  className = undefined,
  imgClassName = undefined,
  children = null,
  ...props
}) {
  return (
    <div className={cn('ds-image-card', RATIOS[ratio] || RATIOS.landscape, className)} {...props}>
      {src ? <img src={src} alt={alt} loading="lazy" className={imgClassName} /> : null}
      {children}
    </div>
  );
}
