import { motion } from 'framer-motion';
import { Compass, HeartHandshake, Megaphone, UsersRound } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { fadeRight, fadeUp, subtleTap } from '@/lib/motion';
import { resolveMediaSrc } from '@/lib/siteContentUtils';
import { aboutTravelConfig } from '@/lib/sitePresentation';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />
);

const missionPillars = [
  {
    title: 'Proclaim Christ',
    description: 'Centred on Jesus in worship, teaching, and everyday witness.',
    Icon: Megaphone,
    bg: 'rgba(96,165,250,0.14)',
    color: 'text-blue-200',
  },
  {
    title: 'Build community',
    description: 'Making space for people to belong, grow, and follow Jesus together.',
    Icon: UsersRound,
    bg: 'rgba(45,212,191,0.12)',
    color: 'text-teal-200',
  },
  {
    title: 'Serve our city',
    description: 'Showing the practical love of Christ across Dundee.',
    Icon: HeartHandshake,
    bg: 'rgba(167,139,250,0.14)',
    color: 'text-violet-200',
  },
];

export default function About() {
  const { content } = useSiteContent();

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
        <div className="section-inner">
          <motion.div {...fadeUp} className="glass-panel-strong lg-iridescent p-6 sm:p-8 lg:p-10">
            {specularLine}
            <div className="relative z-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <span className="glass-chip inline-flex px-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-blue-200">
                  Proclaim · Build · Serve
                </span>
                <div className="mt-5 flex items-center gap-3">
                  <div className="glass-icon-badge shrink-0" style={{ background: 'rgba(59,130,246,0.12)' }}>
                    <Compass className="h-6 w-6 text-blue-200" />
                  </div>
                  <span className="section-kicker">Vision & Mission</span>
                </div>
                <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.85rem]">
                  To see the people of Dundee transformed by Jesus.
                </h2>
                <p className="body-copy mt-5 max-w-2xl">
                  Our mission is simple and shared: Proclaim Christ. Build community. Serve our city.
                </p>
              </div>

              <div className="grid gap-4">
                {missionPillars.map((pillar) => {
                  const Icon = pillar.Icon;

                  return (
                    <div key={pillar.title} className="public-card flex gap-4 p-5 sm:p-6">
                      <div className="glass-icon-badge shrink-0" style={{ background: pillar.bg }}>
                        <Icon className={`h-5 w-5 ${pillar.color}`} />
                      </div>
                      <div>
                        <h3 className="card-title text-lg">{pillar.title}</h3>
                        <p className="body-copy mt-1 text-sm">{pillar.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
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
              <span className="text-blue-300 font-medium">Note:</span> {content.about.sundayExpectations.note}
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
            {content.about.gettingHere.cards.map((card) => {
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
