import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Mail, MapPin, Play, Youtube } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import PrayerRequestForm from '@/components/home/PrayerRequestForm';
import {
  HomeHero,
  Button,
  Section,
  SectionHeader,
  GlassCard,
  FeatureCard,
  InfoCard,
  ImageCard,
  ResponsiveGrid,
} from '@/components/system';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { fadeLeft, fadeRight, fadeUp } from '@/lib/motion';
import { getGlobalSiteInfo, resolveMediaSrc } from '@/lib/siteContentUtils';
import { beliefConfig, quickInfoConfig } from '@/lib/sitePresentation';
import { normalizeSnapshotVideoSermons, useYoutubeSermons } from '@/lib/youtubeSermons';

export default function Home() {
  const { content } = useSiteContent();
  const globalInfo = getGlobalSiteInfo(content);
  const youtubeFeed = useYoutubeSermons(content.settings.links.youtubeChannelId);
  const fallbackVideos = normalizeSnapshotVideoSermons(content.sermons.videoSermons);
  const latestVideoId = youtubeFeed.videos[0]?.id || fallbackVideos[0]?.id || null;
  const trustPoints = [
    {
      title: content.home.hero.serviceBadgeLabel,
      value: `${content.home.hero.serviceBadgeDay} · ${globalInfo.sundayServiceTime || content.home.hero.serviceBadgeTime}`,
      Icon: Play,
      bg: 'rgba(96,165,250,0.14)',
      color: 'text-blue-200',
    },
    {
      title: 'Find us',
      value: globalInfo.addressShort || content.settings.contact.addressShort,
      Icon: MapPin,
      bg: 'rgba(56,189,248,0.12)',
      color: 'text-cyan-200',
    },
    {
      title: 'Get in touch',
      value: globalInfo.contactEmail || content.settings.contact.email,
      Icon: Mail,
      bg: 'rgba(167,139,250,0.14)',
      color: 'text-violet-200',
    },
  ];
  const quickInfoItems = (content.home.quickInfo.items || []).map((item) => {
    if (item.kind === 'service') {
      return {
        ...item,
        sub: `${globalInfo.sundayServiceTime || item.sub}`,
      };
    }

    if (item.kind === 'location') {
      return {
        ...item,
        title: globalInfo.addressLine1 || item.title,
        sub: globalInfo.addressLine2 || item.sub,
      };
    }

    return item;
  });

  return (
    <div className="overflow-x-hidden">
      <SEOHead title={content.home.seo.title} description={content.home.seo.description} path="/" />

      <HomeHero
        slides={content.home.hero.slides}
        eyebrow={content.home.hero.eyebrow}
        titleLead={content.home.hero.titleLead}
        titleHighlight={content.home.hero.titleHighlight}
        description={content.home.hero.description}
        scrollLabel={content.home.hero.scrollLabel}
        primaryCta={(
          <Button to={content.home.hero.primaryCtaPath} size="lg" className="group">
            {content.home.hero.primaryCtaLabel}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
        secondaryCta={(
          <Button to={content.home.hero.secondaryCtaPath} variant="ghost" size="lg">
            <Play className="h-5 w-5" />
            {content.home.hero.secondaryCtaLabel}
          </Button>
        )}
      />

      <Section spacing="compact" width="feature">
        <ResponsiveGrid cols={3} gap="md">
          {quickInfoItems.map((item, index) => {
            const style = quickInfoConfig[item.kind] || quickInfoConfig.service;
            return (
              <motion.div
                key={`${item.title}-${index}`}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.06 }}
              >
                <InfoCard icon={style.Icon} label={item.title} value={item.sub} />
              </motion.div>
            );
          })}
        </ResponsiveGrid>
      </Section>

      <Section spacing="compact" width="feature">
        <motion.div {...fadeUp}>
          <GlassCard variant="feature" className="text-center">
            <p className="ds-eyebrow">Our Mission</p>
            <h2 className="mx-auto mt-4 max-w-feature font-display text-ds-section font-bold text-white">
              <span className="text-gradient">Proclaim · Build · Serve</span>
            </h2>
            <p className="mx-auto mt-4 max-w-text text-ds-body font-medium text-white/75">
              Proclaim Jesus. Build Community. Serve the City.
            </p>
            <Link
              to="/about"
              className="focus-ring mt-6 inline-flex items-center rounded-full text-sm font-semibold text-blue-200 transition-colors hover:text-white"
            >
              Our vision and mission
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </GlassCard>
        </motion.div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <motion.div {...fadeRight} className="order-1 lg:order-none">
            <ImageCard
              src={resolveMediaSrc(content.home.pastors.image)}
              alt={content.home.pastors.image.alt || content.home.pastors.imageTitle}
              ratio="portrait"
              imgClassName="object-top"
            >
              <div className="glass-inline-panel absolute inset-x-4 bottom-4 px-5 py-3 backdrop-blur-md">
                <div className="text-sm font-semibold text-white">{content.home.pastors.imageTitle}</div>
                <div className="text-xs text-blue-300/75">{content.home.pastors.imageSubtitle}</div>
              </div>
            </ImageCard>
          </motion.div>

          <motion.div {...fadeLeft} className="text-center lg:text-left">
            <p className="ds-eyebrow">{content.home.pastors.eyebrow}</p>
            <h2 className="mt-3 font-display text-ds-section font-bold text-white">
              {content.home.pastors.titleLead}
              <br />
              <span className="text-gradient">{content.home.pastors.titleHighlight}</span>
            </h2>
            <div className="mt-5 space-y-4">
              {content.home.pastors.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-ds-body text-white/72">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3 sm:max-w-none sm:grid-cols-4 lg:mx-0">
              {content.home.pastors.stats.map((item) => (
                <GlassCard key={item.label} className="p-4 text-center">
                  <div className="font-display text-2xl font-bold text-gradient">{item.value}</div>
                  <div className="mt-1 text-xs font-medium text-white/60">{item.label}</div>
                </GlassCard>
              ))}
            </div>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Button to={content.home.pastors.ctaPath} variant="ghost" size="md" className="group">
                {content.home.pastors.ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow={content.home.beliefs.eyebrow} title={content.home.beliefs.title} />
        <ResponsiveGrid cols={3} gap="md" className="mt-10">
          {content.home.beliefs.items.map((item, index) => {
            const style = beliefConfig[item.kind] || beliefConfig.worship;
            return (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.08 }}
              >
                <FeatureCard icon={style.Icon} title={item.title} className="h-full">
                  <p className="text-ds-body text-white/70">{item.description}</p>
                </FeatureCard>
              </motion.div>
            );
          })}
        </ResponsiveGrid>
      </Section>

      <Section>
        <SectionHeader eyebrow={content.home.gallery.eyebrow} title={content.home.gallery.title} />
        <div className="mt-10 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {content.home.gallery.topImages.map((asset, index) => (
              <motion.div
                key={`${asset.url}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: Math.min(index * 0.035, 0.12), ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <ImageCard src={resolveMediaSrc(asset)} alt={asset.alt || 'Life at Dundee Elim'} ratio="landscape" />
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {content.home.gallery.bottomImages.map((asset, index) => (
              <motion.div
                key={`${asset.url}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: Math.min(0.12 + index * 0.035, 0.2), ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <ImageCard src={resolveMediaSrc(asset)} alt={asset.alt || 'Life at Dundee Elim'} ratio="wide" />
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-5">
          <motion.div {...fadeLeft} className="lg:col-span-3">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="ds-eyebrow">{content.home.media.eyebrow}</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{content.home.media.title}</h2>
              </div>
              <a
                href={globalInfo.social.youtubeUrl || content.settings.links.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring hidden items-center gap-1.5 rounded-full text-sm text-white/60 transition-colors hover:text-red-400 sm:flex"
              >
                <Youtube className="h-4 w-4" />
                {content.home.media.subscribeLabel}
              </a>
            </div>
            <ImageCard ratio="video" className="mb-4">
              {latestVideoId ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${latestVideoId}?origin=${encodeURIComponent(window.location.origin)}`}
                  title={content.home.media.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Youtube className="h-12 w-12 text-white/20" />
                </div>
              )}
            </ImageCard>
            <Button to={content.home.media.viewAllPath} variant="ghost" size="md">
              {content.home.media.viewAllLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div {...fadeRight} className="lg:col-span-2">
            <GlassCard className="flex h-full flex-col">
              <span className="mb-4 text-sm font-semibold text-white">{content.home.weeklyRhythm.title}</span>
              <div className="space-y-0.5">
                {content.home.weeklyRhythm.items.map((item) => (
                  <div
                    key={`${item.name}-${item.day}`}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-white/55">{item.day}</div>
                    </div>
                    <div className="ml-3 shrink-0 text-sm font-semibold text-blue-300/85">{item.time}</div>
                  </div>
                ))}
              </div>
              <Link
                to={content.home.weeklyRhythm.footerPath}
                className="focus-ring mt-4 flex items-center gap-1.5 rounded-full text-xs text-white/60 transition-colors hover:text-white"
              >
                {content.home.weeklyRhythm.footerLabel}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </Section>

      <PrayerRequestForm />

      <Section width="feature" className="pb-20">
        <motion.div {...fadeUp}>
          <GlassCard variant="feature">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="text-center lg:text-left">
                <p className="ds-eyebrow">Plan Your Visit</p>
                <h2 className="mt-4 font-display text-ds-section font-bold text-white">
                  {content.home.cta.title}
                </h2>
                <p className="mx-auto mt-4 max-w-text text-ds-body text-white/72 lg:mx-0">
                  {content.home.cta.description}
                </p>
                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Button to={content.home.cta.primaryPath} size="md">
                    {content.home.cta.primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    href={content.home.cta.secondaryUrl || content.settings.links.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="ghost"
                    size="md"
                  >
                    <MapPin className="h-4 w-4" />
                    {content.home.cta.secondaryLabel}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {trustPoints.map((item, index) => (
                  <InfoCard
                    key={`closing-${item.title}-${index}`}
                    icon={item.Icon}
                    label={item.title}
                    value={item.value}
                  />
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </Section>
    </div>
  );
}
