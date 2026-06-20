import { motion } from 'framer-motion';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { fadeRight, fadeUp, subtleTap } from '@/lib/motion';
import { getGlobalSiteInfo, resolveMediaSrc } from '@/lib/siteContentUtils';
import { aboutTravelConfig } from '@/lib/sitePresentation';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />
);

const missionPillars = [
  'Proclaim Jesus',
  'Build Community',
  'Serve the City',
];

export default function About() {
  const { content } = useSiteContent();
  const globalInfo = getGlobalSiteInfo(content);
  const gettingHereCards = (content.about.gettingHere.cards || []).map((card) => {
    if (card.kind === 'address') {
      return {
        ...card,
        description: [globalInfo.addressLine1, globalInfo.addressLine2].filter(Boolean).join('\n') || card.description,
        linkUrl: content.settings.links.mapsUrl || card.linkUrl,
      };
    }

    if (card.kind === 'car') {
      return {
        ...card,
        description: [
          globalInfo.parking.parkingNote || card.description,
          `${globalInfo.parking.bellStreetCarParkName}: nearby city-centre paid parking.`,
        ].filter(Boolean).join('\n\n'),
        linkLabel: globalInfo.parking.bellStreetCarParkName || card.linkLabel,
        linkUrl: globalInfo.parking.bellStreetCarParkMapUrl || card.linkUrl,
      };
    }

    return card;
  });

  return (
    <div className="pb-20">
      <SEOHead title={content.about.seo.title} description={content.about.seo.description} path="/about" />

      <div className="page-hero">
        <div className="page-hero-media">
          <img src={resolveMediaSrc(content.about.header.image)} alt={content.about.header.image.alt || 'About Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-inner">
          <span className="page-eyebrow">{content.about.header.eyebrow}</span>
          <h1 className="page-title">
            {content.about.header.titleLead} <span className="text-gradient">{content.about.header.titleHighlight}</span>
          </h1>
          <p className="page-description">{content.about.header.description}</p>
        </div>
      </div>

      <section className="section-wrap">
        <div className="section-inner grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div {...fadeUp} className="relative">
            <div className="absolute -inset-4 rounded-3xl" style={{ background: 'radial-gradient(circle, rgba(80,130,255,0.12) 0%, transparent 70%)' }} />
            <div className="public-media">
              <img src={resolveMediaSrc(content.about.pastors.image)} alt={content.about.pastors.image.alt || 'Pastors'} className="w-full object-cover shadow-2xl" />
            </div>
          </motion.div>
          <motion.div {...fadeRight}>
            <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.about.pastors.eyebrow}</span>
            <h2 className="section-title mb-6 text-left">
              {content.about.pastors.titleLead}
              <br />
              {content.about.pastors.titleHighlight}
            </h2>
            {content.about.pastors.paragraphs.map((paragraph) => (
              <p key={paragraph} className="body-copy mb-4">
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-wrap-compact">
        <div className="section-inner-narrow">
          <motion.div
            {...fadeUp}
            className="glass-panel px-6 py-7 text-center sm:px-8 sm:py-9 lg:px-10 lg:py-11"
            style={{
              background:
                'linear-gradient(135deg, rgba(14,27,56,0.9), rgba(8,13,31,0.92)), radial-gradient(circle at 50% 0%, rgba(56,189,248,0.13), transparent 52%), radial-gradient(circle at 100% 100%, rgba(139,92,246,0.12), transparent 46%)',
              borderColor: 'rgba(255,255,255,0.13)',
            }}
          >
            {specularLine}
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-semibold leading-tight text-cyan-100 sm:text-3xl">
                Vision & Mission
              </h2>
              <h2 className="mx-auto mt-5 max-w-3xl font-display text-[2rem] font-bold leading-[1.12] text-white sm:text-[2.45rem] sm:leading-[1.1] lg:text-[2.65rem]">
                To see the people of Dundee transformed by Jesus.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-white/72 sm:text-lg sm:leading-9">
                We live this out through three simple commitments.
              </p>

              <div className="mx-auto mt-8 flex max-w-2xl flex-col overflow-hidden rounded-[var(--radius-soft)] border border-white/10 bg-white/[0.035] sm:flex-row">
                {missionPillars.map((pillar) => (
                  <div key={pillar} className="border-b border-white/10 px-5 py-[1.125rem] last:border-b-0 sm:flex-1 sm:border-b-0 sm:border-r sm:px-5 sm:py-5 sm:last:border-r-0">
                    <h3 className="font-display text-[1.22rem] font-semibold leading-[1.25] text-white sm:text-xl">{pillar}</h3>
                  </div>
                ))}
              </div>

              <p className="mt-7 bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text font-display text-xl font-semibold leading-[1.15] text-transparent sm:text-2xl">
                Proclaim · Build · Serve
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-wrap pb-8 sm:pb-10 lg:pb-12">
        <div className="section-inner">
          <div className="section-heading">
            <h2 className="section-title">{content.about.sundayExpectations.title}</h2>
            <p className="section-copy">{content.about.sundayExpectations.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.about.sundayExpectations.items.map((item) => (
              <motion.div key={item.number} {...fadeUp} className="public-card">
                {specularLine}
                <div className="text-4xl font-display font-bold mb-3" style={{ color: 'rgba(96,165,250,0.2)' }}>{item.number}</div>
                <h3 className="card-title mb-2 text-lg">{item.title}</h3>
                <p className="body-copy text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="glass-panel mt-5 p-6">
            {specularLine}
            <p className="body-copy text-center text-sm whitespace-pre-line">
              <span className="text-blue-300 font-medium">Note:</span> {[globalInfo.communionNote, content.about.sundayExpectations.note].filter(Boolean).join(' ')}
            </p>
          </div>
        </div>
      </section>

      <section className="section-wrap pt-8 sm:pt-10 lg:pt-12">
        <div className="section-inner">
          <div className="section-heading">
            <h2 className="section-title">{content.about.gettingHere.title}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            {gettingHereCards.map((card) => {
              const style = aboutTravelConfig[card.kind] || aboutTravelConfig.address;
              const Icon = style.Icon;

              return (
                <motion.div key={card.title} {...fadeUp} className="public-card">
                  {specularLine}
                  <div className="glass-icon-badge mb-4" style={{ background: style.bg }}>
                    <Icon className={`w-6 h-6 ${style.color}`} />
                  </div>
                  <h3 className="card-title mb-3 text-lg">{card.title}</h3>
                  <p className="body-copy text-sm whitespace-pre-line">{card.description}</p>
                  {card.linkLabel && card.linkUrl && (
                    <motion.a {...subtleTap} href={card.linkUrl} target="_blank" rel="noreferrer" className="glass-action-soft mt-4 inline-flex px-5 text-sm text-blue-300 hover:text-white">
                      {card.linkLabel} →
                    </motion.a>
                  )}
                </motion.div>
              );
            })}
          </div>
          {globalInfo.parking.parkingChargesUrl && (
            <div className="mb-5 text-center">
              <motion.a
                {...subtleTap}
                href={globalInfo.parking.parkingChargesUrl}
                target="_blank"
                rel="noreferrer"
                className="glass-action-soft inline-flex px-5 text-sm text-blue-300 hover:text-white"
              >
                Dundee City Council parking charges →
              </motion.a>
            </div>
          )}
          <motion.div {...fadeUp} className="public-media">
            <iframe
              src={content.about.gettingHere.mapEmbedUrl || content.settings.links.mapsEmbedUrl}
              className="w-full h-72"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Church Location"
            />
          </motion.div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-inner-narrow">
          <div className="glass-panel lg-iridescent p-6 text-center sm:p-10">
            {specularLine}
            <div className="relative z-10">
              <h2 className="section-title mb-4 text-3xl">{content.about.network.title}</h2>
              <p className="body-copy mb-4 text-sm">{content.about.network.description}</p>
              <motion.a {...subtleTap} href={content.about.network.linkUrl} target="_blank" rel="noreferrer" className="glass-action-soft inline-flex px-5 text-sm font-medium text-blue-300 hover:text-white">
                {content.about.network.linkLabel} →
              </motion.a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
