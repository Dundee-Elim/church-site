import { motion } from 'framer-motion';
import { ArrowRight, Globe, Heart, Mail, Phone } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { giveMethodConfig } from '@/lib/sitePresentation';
import { fadeUp, subtleTap } from '@/lib/motion';
import { formatPhoneHref, getGlobalSiteInfo, resolveMediaSrc } from '@/lib/siteContentUtils';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
);

export default function Give() {
  const { content } = useSiteContent();
  const globalInfo = getGlobalSiteInfo(content);
  const onlineMethod = (content.give.methods || []).find((method) => method.kind === 'online') || { kind: 'online', title: '', description: '', ctaLabel: '', ctaUrl: '' };
  const OnlineIcon = giveMethodConfig.online.Icon;
  const giveOnlineMethod = {
    ...onlineMethod,
    ctaLabel: globalInfo.giving.onlineGivingLabel || onlineMethod.ctaLabel,
    ctaUrl: globalInfo.giving.onlineGivingUrl || onlineMethod.ctaUrl,
    title: onlineMethod.title || globalInfo.giving.onlineGivingLabel || 'Give Online',
    description: onlineMethod.description || 'Give securely online as a one-off payment or set up regular giving.',
  };

  return (
    <div className="pb-20">
      <SEOHead title={content.give.seo.title} description={content.give.seo.description} path="/give" />

      <div className="page-hero">
        <div className="page-hero-media">
          <img src={resolveMediaSrc(content.give.header.image)} alt={content.give.header.image.alt || 'Giving at Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-inner">
          <span className="page-eyebrow">{content.give.header.eyebrow}</span>
          <h1 className="page-title">
            {content.give.header.titleLead} <span className="text-gradient">{content.give.header.titleHighlight}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg italic leading-8 text-white/58">{content.give.header.quote}</p>
          <p className="mt-2 text-sm font-medium text-blue-300/72">— {content.give.header.quoteCitation}</p>
        </div>
      </div>

      <section className="section-wrap-compact">
        <div className="section-inner-narrow">
          <div className="glass-panel-strong p-6 text-center sm:p-10">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))' }} />
            <div className="relative z-10">
              <Heart className="w-10 h-10 text-red-400 mx-auto mb-5" />
              <blockquote className="font-display text-xl sm:text-2xl text-white/90 italic mb-4 leading-relaxed">{content.give.scripture.quote}</blockquote>
              <cite className="text-blue-300/70 text-sm">— {content.give.scripture.citation}</cite>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-inner">
          <h2 className="section-title mb-8 text-center sm:mb-10">{content.give.methodsTitle}</h2>
          <div className="public-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <motion.div {...fadeUp} className="public-card md:col-span-2 lg:col-span-1">
              <div className="glass-icon-badge mb-5" style={{ background: giveMethodConfig.online.bg }}>
                <OnlineIcon className={`w-7 h-7 ${giveMethodConfig.online.color}`} />
              </div>
              <h3 className="card-title mb-3">{giveOnlineMethod.title}</h3>
              <p className="body-copy mb-4 text-sm">{giveOnlineMethod.description}</p>
              {giveOnlineMethod.ctaLabel && giveOnlineMethod.ctaUrl && (
                <motion.a {...subtleTap} href={giveOnlineMethod.ctaUrl} target="_blank" rel="noreferrer" className="glass-action-primary px-5 text-sm font-semibold">
                  {giveOnlineMethod.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </motion.a>
              )}
              <div className="glass-inline-panel mt-4 p-4 text-sm">
                {globalInfo.giving.qrCodeImage?.url || globalInfo.giving.qrCodeImage?.path ? (
                  <img
                    src={resolveMediaSrc(globalInfo.giving.qrCodeImage)}
                    alt={globalInfo.giving.qrCodeImage.alt || 'Giving QR code'}
                    className="mx-auto mb-3 h-36 w-36 rounded-lg object-contain"
                  />
                ) : (
                  <div className="mx-auto mb-3 flex h-36 w-36 items-center justify-center rounded-lg border border-dashed border-white/20 text-center text-xs text-white/45">
                    QR code coming soon
                  </div>
                )}
                <p className="text-white/55">{globalInfo.giving.qrCodeNote || 'Please contact the church office if you need help with giving.'}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-wrap-compact">
        <div className="section-inner-narrow">
          <div className="public-card flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="glass-icon-badge shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <Globe className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h3 className="card-title mb-2">{content.give.giftAid.title}</h3>
              <p className="body-copy mb-4 text-sm">{content.give.giftAid.description}</p>
              <motion.a {...subtleTap} href={content.give.giftAid.ctaUrl} target="_blank" rel="noreferrer" className="glass-action-soft inline-flex px-5 text-sm font-medium text-green-300 hover:text-white" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                {content.give.giftAid.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-inner">
          <h2 className="section-title mb-8 text-center sm:mb-10">{content.give.impact.title}</h2>
          <p className="section-copy mb-8 text-center">
            Giving supports this part of our mission: Serve our city.
          </p>
          <div className="public-grid grid-cols-2 sm:grid-cols-4">
            {content.give.impact.items.map((item) => (
              <div key={item.label} className="public-card text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="body-copy text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap-compact">
        <div className="public-card section-inner-narrow text-center">
          <h3 className="text-white font-semibold text-lg mb-2">{content.give.contactCta.title}</h3>
          <p className="body-copy mb-5 text-sm">{content.give.contactCta.description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.a {...subtleTap} href={`mailto:${globalInfo.contactEmail || content.settings.contact.email}`} className="glass-action-soft px-5 text-sm font-medium text-blue-300 hover:text-white">
              <Mail className="w-4 h-4" />
              {globalInfo.contactEmail || content.settings.contact.email}
            </motion.a>
            <motion.a {...subtleTap} href={`tel:${formatPhoneHref(globalInfo.mobileNumberHref || globalInfo.mobileNumberDisplay || content.settings.contact.phoneHref || content.settings.contact.phoneDisplay)}`} className="glass-action-soft px-5 text-sm font-medium text-blue-300 hover:text-white">
              <Phone className="w-4 h-4" />
              {globalInfo.mobileNumberDisplay || content.settings.contact.phoneDisplay}
            </motion.a>
          </div>
        </div>
      </section>
    </div>
  );
}
