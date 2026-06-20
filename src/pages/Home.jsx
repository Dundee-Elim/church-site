import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Mail, MapPin, Play, Youtube } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import PrayerRequestForm from '@/components/home/PrayerRequestForm';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { cardHover, fadeLeft, fadeRight, fadeUp, subtleTap } from '@/lib/motion';
import { resolveMediaSrc } from '@/lib/siteContentUtils';
import { beliefConfig, quickInfoConfig } from '@/lib/sitePresentation';
import { normalizeSnapshotVideoSermons, useYoutubeSermons } from '@/lib/youtubeSermons';

function HeroSlideshow({ slides }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrent((index) => (index + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[current];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.img
          key={`${activeSlide.caption}-${current}`}
          src={resolveMediaSrc(activeSlide.image)}
          alt={activeSlide.image.alt || activeSlide.caption}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 0.3, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.05 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background" />
    </div>
  );
}

export default function Home() {
  const { content } = useSiteContent();
  const youtubeFeed = useYoutubeSermons(content.settings.links.youtubeChannelId);
  const fallbackVideos = normalizeSnapshotVideoSermons(content.sermons.videoSermons);
  const latestVideoId = youtubeFeed.videos[0]?.id || fallbackVideos[0]?.id || null;
  const trustPoints = [
    {
      title: content.home.hero.serviceBadgeLabel,
      value: `${content.home.hero.serviceBadgeDay} · ${content.home.hero.serviceBadgeTime}`,
      Icon: Play,
      bg: 'rgba(96,165,250,0.14)',
      color: 'text-blue-200',
    },
    {
      title: 'Find us',
      value: content.settings.contact.addressShort,
      Icon: MapPin,
      bg: 'rgba(56,189,248,0.12)',
      color: 'text-cyan-200',
    },
    {
      title: 'Get in touch',
      value: content.settings.contact.email,
      Icon: Mail,
      bg: 'rgba(167,139,250,0.14)',
      color: 'text-violet-200',
    },
  ];

  return (
    <div className="overflow-x-hidden">
      <SEOHead title={content.home.seo.title} description={content.home.seo.description} path="/" />

      <section className="relative flex min-h-screen items-center justify-center px-4 pb-20 pt-28 sm:pt-32">
        <HeroSlideshow slides={content.home.hero.slides} />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <span
              className="glass-chip inline-flex px-5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-blue-200"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}
            >
              {content.home.hero.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.12 }}
            className="mt-6 mb-6 font-display text-5xl font-bold leading-[0.95] text-white glow-text sm:text-6xl lg:text-[5.1rem]"
          >
            {content.home.hero.titleLead}
            <br />
            <span className="text-gradient">{content.home.hero.titleHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.58, delay: 0.25 }}
            className="mx-auto mb-8 max-w-3xl text-base leading-8 text-white/70 sm:text-xl"
          >
            {content.home.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.42 }}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <motion.div {...subtleTap}>
              <Link to={content.home.hero.primaryCtaPath} className="glass-action-primary group px-8 text-base sm:text-lg">
                {content.home.hero.primaryCtaLabel}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div {...subtleTap}>
              <Link to={content.home.hero.secondaryCtaPath} className="glass-action-secondary px-8 text-base sm:text-lg">
                <Play className="w-5 h-5" />
                {content.home.hero.secondaryCtaLabel}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-none"
        >
          <div className="w-px h-10 bg-gradient-to-b from-white/0 to-white/40" />
          <span className="text-white/55 text-xs uppercase tracking-widest">{content.home.hero.scrollLabel}</span>
        </motion.div>
      </section>

      <section className="section-wrap-compact">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          {content.home.quickInfo.items.map((item, index) => {
            const style = quickInfoConfig[item.kind] || quickInfoConfig.service;
            const Icon = style.Icon;

            return (
              <motion.div
                key={`${item.title}-${index}`}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                className="public-card flex items-center gap-4"
              >
                <div className="glass-icon-badge shrink-0" style={{ background: style.bg }}>
                  <Icon className={`w-6 h-6 ${style.color}`} />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{item.title}</div>
                  <div className="metadata-text mt-0.5">{item.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="section-wrap-compact pt-2">
        <div className="section-inner-narrow">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[var(--radius-panel)] border border-white/10 px-5 py-9 text-center sm:px-8 sm:py-11"
            style={{
              background:
                'linear-gradient(135deg, rgba(14,27,56,0.9), rgba(8,13,31,0.92)), radial-gradient(circle at 50% 0%, rgba(56,189,248,0.13), transparent 52%), radial-gradient(circle at 100% 100%, rgba(139,92,246,0.12), transparent 46%)',
              borderColor: 'rgba(255,255,255,0.13)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.24)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(125,211,252,0.32), transparent)' }} />
            <div className="relative z-10">
              <span className="section-kicker text-cyan-200/85">Our Mission</span>
              <h2 className="mx-auto mt-4 max-w-4xl bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text font-display text-[2.35rem] font-bold leading-[1.08] text-transparent sm:text-5xl sm:leading-[1.06] lg:text-[3.85rem]">
                Proclaim · Build · Serve
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-white/76 sm:text-lg sm:leading-9">
                Proclaim Christ. Build community. Serve our city.
              </p>
              <Link to="/about" className="focus-ring mt-7 inline-flex rounded-full text-sm font-semibold text-cyan-100 transition-colors hover:text-white">
                Our vision and mission
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-wrap-spacious">
        <div className="section-inner grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <motion.div
            {...fadeRight}
            className="relative order-1 lg:order-none"
          >
            <div className="absolute -inset-6 rounded-3xl" style={{ background: 'radial-gradient(circle, rgba(80,130,255,0.15) 0%, transparent 70%)' }} />
            <div className="public-media relative">
              <img src={resolveMediaSrc(content.home.pastors.image)} alt={content.home.pastors.image.alt || content.home.pastors.imageTitle} className="w-full object-cover object-top shadow-2xl" />
            </div>
            <div className="glass-inline-panel absolute bottom-6 left-6 right-6 px-5 py-3 backdrop-blur-md">
              <div className="text-white font-semibold text-sm">{content.home.pastors.imageTitle}</div>
              <div className="text-blue-300/70 text-xs">{content.home.pastors.imageSubtitle}</div>
            </div>
          </motion.div>

          <motion.div {...fadeLeft}>
            <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.home.pastors.eyebrow}</span>
            <h2 className="section-title mb-6 text-left sm:text-5xl">
              {content.home.pastors.titleLead}
              <br />
              <span className="text-gradient">{content.home.pastors.titleHighlight}</span>
            </h2>
            {content.home.pastors.paragraphs.map((paragraph) => (
              <p key={paragraph} className="body-copy mb-4">
                {paragraph}
              </p>
            ))}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {content.home.pastors.stats.map((item) => (
                <div key={item.label} className="public-card p-4 text-center">
                  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
                  <div className="font-display text-2xl font-bold text-gradient">{item.value}</div>
                  <div className="metadata-text mt-1">{item.label}</div>
                </div>
              ))}
            </div>
            <motion.div {...subtleTap}>
              <Link to={content.home.pastors.ctaPath} className="glass-action-secondary group px-6 text-sm font-medium">
                {content.home.pastors.ctaLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-inner">
          <motion.div {...fadeUp} className="section-heading">
            <span className="section-kicker">{content.home.beliefs.eyebrow}</span>
            <h2 className="section-title">{content.home.beliefs.title}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {content.home.beliefs.items.map((item, index) => {
              const style = beliefConfig[item.kind] || beliefConfig.worship;
              const Icon = style.Icon;

              return (
                <motion.div
                  key={item.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                  {...cardHover}
                  className="public-card-strong lg-iridescent text-center"
                >
                  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                  <div className="relative z-10">
                    <div className="glass-icon-badge mb-5" style={{ background: style.bg }}>
                      <Icon className={`w-8 h-8 ${style.color}`} />
                    </div>
                    <h3 className="card-title mb-3">{item.title}</h3>
                    <p className="body-copy text-sm">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-inner">
          <motion.div {...fadeUp} className="section-heading">
            <span className="section-kicker">{content.home.gallery.eyebrow}</span>
            <h2 className="section-title">{content.home.gallery.title}</h2>
          </motion.div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {content.home.gallery.topImages.map((asset, index) => (
                <motion.div
                  key={`${asset.url}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: Math.min(index * 0.035, 0.12), ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="public-media aspect-[4/3]"
                >
                  <img src={resolveMediaSrc(asset)} alt={asset.alt || 'Life at Dundee Elim'} loading="lazy" className="h-full w-full object-cover" />
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {content.home.gallery.bottomImages.map((asset, index) => (
                <motion.div
                  key={`${asset.url}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: Math.min(0.12 + index * 0.035, 0.2), ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="public-media aspect-[16/9] sm:aspect-[16/7]"
                >
                  <img src={resolveMediaSrc(asset)} alt={asset.alt || 'Life at Dundee Elim'} loading="lazy" className="h-full w-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-inner grid grid-cols-1 items-stretch gap-8 lg:grid-cols-5">
          <motion.div {...fadeLeft} className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="section-kicker">{content.home.media.eyebrow}</span>
                <h2 className="section-title mt-1 text-3xl">{content.home.media.title}</h2>
              </div>
              <a
                href={content.settings.links.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring hidden items-center gap-1.5 rounded-full text-sm text-white/55 transition-colors hover:text-red-400 sm:flex"
              >
                <Youtube className="w-4 h-4" />
                {content.home.media.subscribeLabel}
              </a>
            </div>
            <div className="public-media glow-blue mb-4">
              <div className="public-media-frame aspect-video w-full overflow-hidden bg-black/40">
                {latestVideoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${latestVideoId}?origin=${encodeURIComponent(window.location.origin)}`}
                    title={content.home.media.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Youtube className="w-12 h-12 text-white/20" />
                  </div>
                )}
              </div>
            </div>
            <Link to={content.home.media.viewAllPath} className="glass-action-secondary px-5 text-sm font-medium">
              {content.home.media.viewAllLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div {...fadeRight} className="lg:col-span-2">
            <div className="public-card h-full">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-white font-semibold text-sm">{content.home.weeklyRhythm.title}</span>
              </div>
              <div className="space-y-0.5">
                {content.home.weeklyRhythm.items.map((item) => (
                  <div key={`${item.name}-${item.day}`} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div className="text-white text-sm font-medium">{item.name}</div>
                      <div className="metadata-text">{item.day}</div>
                    </div>
                    <div className="text-blue-300/80 text-sm font-semibold shrink-0 ml-3">{item.time}</div>
                  </div>
                ))}
              </div>
              <Link to={content.home.weeklyRhythm.footerPath} className="focus-ring mt-4 flex items-center gap-1.5 rounded-full text-xs text-white/55 transition-colors hover:text-white">
                {content.home.weeklyRhythm.footerLabel}
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PrayerRequestForm />

      <section className="section-wrap pb-20">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="glass-panel-strong lg-iridescent p-6 sm:p-10 lg:p-12">
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="text-center lg:text-left">
                <span className="inline-block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-blue-200/75">
                  Plan Your Visit
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[3rem]">
                  {content.home.cta.title}
                </h2>
                <p className="body-copy mt-4 max-w-2xl sm:text-lg lg:max-w-xl">
                  {content.home.cta.description}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <motion.div {...subtleTap}>
                    <Link to={content.home.cta.primaryPath} className="glass-action-primary px-7 text-base">
                      {content.home.cta.primaryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                  <motion.div {...subtleTap}>
                    <a
                      href={content.home.cta.secondaryUrl || content.settings.links.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="glass-action-secondary px-7 text-base"
                    >
                      <MapPin className="w-4 h-4" />
                      {content.home.cta.secondaryLabel}
                    </a>
                  </motion.div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {trustPoints.map((item, index) => {
                  const Icon = item.Icon;

                    return (
                    <div key={`closing-${item.title}-${index}`} className="public-card px-4 py-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="glass-icon-badge" style={{ background: item.bg }}>
                          <Icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="metadata-text text-[0.68rem] font-semibold uppercase tracking-[0.24em]">{item.title}</div>
                          <div className="mt-1 text-sm font-medium leading-6 text-white/90">{item.value}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
