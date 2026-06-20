import { Link } from 'react-router-dom';
import { MapPin, Clock, Mail, Youtube, Facebook } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { getGlobalSiteInfo, resolveMediaSrc } from '@/lib/siteContentUtils';

export default function Footer() {
  const { content } = useSiteContent();
  const globalInfo = getGlobalSiteInfo(content);
  const serviceCard = content.contact.infoCards.find((card) => card.kind === 'service');
  const serviceItems = [
    { label: 'Sunday Service', value: globalInfo.sundayServiceTime },
    ...(globalInfo.communionNote ? [{ label: 'Communion', value: globalInfo.communionNote }] : []),
  ].filter((item) => item.value) || (serviceCard?.items || []);

  return (
    <footer className="relative">
      <div className="lg-surface-deep">
        <div className="mx-auto max-w-page px-5 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr_0.9fr_0.95fr]">

            {/* Brand */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-4 flex flex-col items-center md:items-start">
                <img src={resolveMediaSrc(content.settings.branding.logo)} alt={content.settings.siteName} className="h-20 w-20 object-contain" />
                <div className="text-center md:text-left">
                  <div className="font-display text-2xl font-bold leading-tight text-white">{content.settings.shortName}</div>
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-blue-300/70">{content.settings.tagline}</div>
                </div>
              </div>
              <p className="max-w-xs text-base leading-7 text-white/70">
                {content.settings.footerDescription}
              </p>
              <div className="mt-6 flex justify-center gap-2 md:justify-start">
                <a href={globalInfo.social.youtubeUrl || content.settings.links.youtubeUrl} target="_blank" rel="noreferrer" aria-label="Dundee Elim on YouTube"
                  className="glass-inline-panel glass-icon-badge focus-ring text-white/75 transition-colors hover:text-red-400"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Youtube className="h-4 w-4" />
                </a>
                <a href={globalInfo.social.facebookUrl || content.settings.links.facebookUrl} target="_blank" rel="noreferrer" aria-label="Dundee Elim on Facebook"
                  className="glass-inline-panel glass-icon-badge focus-ring text-white/75 transition-colors hover:text-blue-400"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Facebook className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Quick Links</h3>
              <ul className="mx-auto grid max-w-[16rem] grid-cols-2 gap-x-4 gap-y-3 md:mx-0">
                {[['Home', '/'], ['About', '/about'], ['Sermons', '/sermons'], ['Events', '/events'], ['Ministries', '/ministries'], ['Give', '/give'], ['Safeguarding', '/safeguarding'], ['Contact', '/contact']].map(([label, path]) => (
                  <li key={path}>
                    <Link to={path} className="focus-ring inline-flex min-h-[44px] items-center rounded-sm text-sm text-white/70 transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Times */}
            <div className="text-center md:text-left">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Services</h3>
              <div className="space-y-3">
                {serviceItems.map((item) => (
                  <div key={item.label} className="glass-inline-panel flex items-start gap-2.5 px-4 py-3 text-left">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-400/70" />
                    <div>
                      <div className="text-sm font-medium text-white/85">{item.label}</div>
                      <div className="text-sm text-white/60">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="text-center md:text-left">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Find Us</h3>
              <div className="space-y-3">
                <div className="glass-inline-panel flex items-start gap-2.5 px-4 py-3 text-left">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400/70" />
                  <div className="text-sm text-white/70">{globalInfo.addressShort || content.settings.contact.addressShort}</div>
                </div>
                <div className="glass-inline-panel flex items-start gap-2.5 px-4 py-3 text-left">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-400/70" />
                  <a href={`mailto:${globalInfo.contactEmail || content.settings.contact.email}`} className="focus-ring rounded-sm text-sm text-white/70 transition-colors hover:text-blue-300">
                    {globalInfo.contactEmail || content.settings.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 pt-6 text-center sm:flex-row sm:text-left"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/50">© {new Date().getFullYear()} {content.settings.siteName}. All rights reserved.</p>
            <p className="text-xs text-white/50">Part of <a href={content.settings.links.elimUrl} target="_blank" rel="noreferrer" className="focus-ring rounded-sm transition-colors hover:text-blue-300">Elim Pentecostal Churches</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
