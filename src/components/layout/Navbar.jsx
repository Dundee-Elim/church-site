import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { navPillSpring } from '@/lib/motion';
import { resolveMediaSrc } from '@/lib/siteContentUtils';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Sermons', path: '/sermons' },
  { label: 'Events', path: '/events' },
  { label: 'Ministries', path: '/ministries' },
  { label: 'Give', path: '/give' },
  { label: 'Safeguarding', path: '/safeguarding' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const { content } = useSiteContent();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pillStyle, setPillStyle] = useState(null);
  const desktopNavRef = useRef(null);
  const linkRefs = useRef({});
  const location = useLocation();

  useLayoutEffect(() => {
    function syncPill() {
      const container = desktopNavRef.current;
      const activeLink = linkRefs.current[location.pathname];

      if (!container || !activeLink) {
        setPillStyle(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();

      setPillStyle({
        x: linkRect.left - containerRect.left,
        y: linkRect.top - containerRect.top,
        width: linkRect.width,
        height: linkRect.height,
      });
    }

    syncPill();
    window.addEventListener('resize', syncPill);

    return () => window.removeEventListener('resize', syncPill);
  }, [location.pathname, scrolled]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 sm:pt-4">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`w-full max-w-7xl transition-all duration-500 ${
          scrolled
            ? 'glass-panel-strong'
            : 'glass-panel'
        }`}
        style={{ position: 'relative' }}
      >
        <div className="py-1 pl-1 pr-3 sm:py-0 sm:pl-2 sm:pr-5">
          <div className="flex min-h-[4.35rem] items-center justify-between gap-3 sm:min-h-[5.25rem]">
            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <img src={resolveMediaSrc(content.settings.branding.logo)} alt={content.settings.siteName} className="h-16 w-16 object-contain sm:h-[5.4rem] sm:w-[5.4rem]" />
              <div className="hidden sm:block -ml-2">
                <div className="font-display text-[1.08rem] font-bold leading-tight text-white">{content.settings.shortName}</div>
                <div className="text-[0.64rem] uppercase tracking-[0.28em] text-blue-300/80">{content.settings.tagline}</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div ref={desktopNavRef} className="relative hidden items-center gap-1 lg:flex">
              {pillStyle ? (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset',
                  }}
                  initial={false}
                  animate={pillStyle}
                  transition={navPillSpring}
                />
              ) : null}
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  ref={(node) => {
                    if (node) {
                      linkRefs.current[link.path] = node;
                    } else {
                      delete linkRefs.current[link.path];
                    }
                  }}
                  className={`focus-ring relative inline-flex min-h-[2.45rem] items-center rounded-full px-2.5 text-[0.83rem] font-medium transition-colors duration-200 xl:min-h-[2.55rem] xl:px-4 xl:text-sm ${
                    location.pathname === link.path
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
              className="glass-light focus-ring rounded-full p-2.5 transition-colors lg:hidden"
              style={{
                borderColor: 'rgba(255,255,255,0.14)',
              }}
            >
              {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="overflow-hidden lg:hidden"
            >
              <div className="space-y-2 px-3 pb-4 pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`glass-chip block w-full px-4 py-3 text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'glass-chip-active text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
