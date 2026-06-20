import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import LiquidGlassBackground from './LiquidGlassBackground';
import { useSiteContent } from '@/contexts/SiteContentContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function BrowserRenderClass() {
  useEffect(() => {
    const isEdge = /Edg\//.test(window.navigator.userAgent);
    document.documentElement.classList.toggle('edge-render-fallback', isEdge);

    return () => {
      document.documentElement.classList.remove('edge-render-fallback');
    };
  }, []);

  return null;
}

export default function Layout() {
  const siteContent = useSiteContent();
  const isInitialContentLoad = siteContent.loading && siteContent.source === 'loading';

  if (isInitialContentLoad) {
    return (
      <div className="relative isolate min-h-screen overflow-x-hidden bg-transparent">
        <BrowserRenderClass />
        <LiquidGlassBackground />
        <ScrollToTop />
        <main className="relative flex min-h-screen items-center justify-center px-6 text-center">
          <div className="max-w-md rounded-2xl border border-white/10 bg-black/20 px-6 py-5 backdrop-blur-sm">
            <p className="text-sm text-white/65">Loading latest website content...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-transparent">
      <BrowserRenderClass />
      <LiquidGlassBackground />
      <ScrollToTop />
      <Navbar />
      <main className="relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
