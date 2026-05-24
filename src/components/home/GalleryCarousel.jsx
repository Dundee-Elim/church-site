import { useRef, useEffect } from 'react';

export default function GalleryCarousel({ images }) {
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const velRef = useRef(0);
  const speedRef = useRef(-0.32); // negative = scroll left
  const targetSpeedRef = useRef(-0.32);

  // Repeat images enough times to always fill the screen
  const items = [...images, ...images, ...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) return;

    let raf;
    let lastTimestamp = 0;

    const getSetWidth = () => {
      const children = track.children;
      if (!children.length) return 0;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 16;
      return (children[0].offsetWidth + gap) * images.length;
    };

    const clamp = () => {
      const setW = getSetWidth();
      if (setW === 0) return;
      // Keep position within [-setW*2, 0] range by wrapping
      while (posRef.current > 0) posRef.current -= setW;
      while (posRef.current < -setW * 2) posRef.current += setW;
    };

    const loop = (timestamp) => {
      if (lastTimestamp && timestamp - lastTimestamp < 24) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastTimestamp = timestamp;

      if (!isDragging.current) {
        speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.04;
        posRef.current += speedRef.current;
      }
      clamp();
      track.style.transform = `translateX(${posRef.current}px)`;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [images.length]);

  const startDrag = (x) => {
    isDragging.current = true;
    lastX.current = x;
    velRef.current = 0;
  };

  const moveDrag = (x) => {
    if (!isDragging.current) return;
    const dx = x - lastX.current;
    lastX.current = x;
    velRef.current = dx;
    posRef.current += dx;
  };

  const endDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const v = velRef.current;
    speedRef.current = v !== 0 ? Math.max(-1.4, Math.min(1.4, v * 0.12)) : targetSpeedRef.current;
  };

  return (
    <div className="relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing">
      {/* Fade left */}
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #0d2050, transparent)' }} />
      {/* Fade right */}
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #0d2050, transparent)' }} />

      <div
        ref={trackRef}
        className="flex"
        style={{ gap: '16px', width: 'max-content', transform: 'translate3d(0, 0, 0)' }}
        onMouseDown={e => { startDrag(e.clientX); e.preventDefault(); }}
        onMouseMove={e => moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={e => startDrag(e.touches[0].clientX)}
        onTouchMove={e => { moveDrag(e.touches[0].clientX); }}
        onTouchEnd={endDrag}
      >
        {items.map((src, i) => (
          <div key={i} className="shrink-0 w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden">
            <img
              src={src}
              alt="Life at Dundee Elim"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
