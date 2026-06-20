import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Mail, Phone, X } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import {
  Button,
  GlassCard,
  ImageCard,
  PageHero,
  ResponsiveGrid,
  Section,
} from '@/components/system';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { ministryIconMap, ministryTagStyles } from '@/lib/sitePresentation';
import { cardHover, fadeUp } from '@/lib/motion';
import { filterPublishedItems, formatPhoneHref, getGlobalSiteInfo, resolveMediaSrc } from '@/lib/siteContentUtils';

function isExternalUrl(url) {
  return /^https?:\/\//i.test(url || '');
}

function getNextStep(item) {
  if (item.linkLabel) {
    return item.linkLabel;
  }

  if (item.contactEmail || item.contactPhone) {
    return 'Contact the team';
  }

  return 'Ask us about this';
}

function getMetaLabel(detail) {
  const value = detail.toLowerCase();

  if (value.includes('sunday') || value.includes('tuesday') || value.includes('thursday') || value.includes('monthly') || /\d/.test(value)) {
    return 'When';
  }

  if (value.includes('church') || value.includes('dundee') || value.includes('home')) {
    return 'Where';
  }

  if (value.includes('age') || value.includes('everyone') || value.includes('young') || value.includes('ladies') || value.includes('men')) {
    return 'For';
  }

  return 'Focus';
}

function MinistryAction({ item, className = '' }) {
  const label = getNextStep(item);

  if (item.linkLabel && item.linkUrl) {
    if (isExternalUrl(item.linkUrl)) {
      return (
        <Button href={item.linkUrl} target="_blank" rel="noreferrer" variant="soft" size="sm" className={className}>
          {label}
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      );
    }

    return (
      <Button to={item.linkUrl} variant="soft" size="sm" className={className}>
        {label}
      </Button>
    );
  }

  return (
    <span className={`inline-flex min-h-[2.75rem] items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-blue-200 ${className}`}>
      {label}
    </span>
  );
}

export default function Ministries() {
  const { content } = useSiteContent();
  const globalInfo = getGlobalSiteInfo(content);
  const [selected, setSelected] = useState(null);
  const [activeTag, setActiveTag] = useState('All');

  const tags = ['All', ...Object.keys(ministryTagStyles)];
  const publishedMinistries = filterPublishedItems(content.ministries.items);
  const visible = activeTag === 'All' ? publishedMinistries : publishedMinistries.filter((item) => item.tag === activeTag);
  const selectedEmail = selected?.contactEmail || globalInfo.contactEmail;
  const selectedPhone = selected?.contactPhone || globalInfo.mobileNumberDisplay;

  return (
    <div className="pb-20">
      <SEOHead title={content.ministries.seo.title} description={content.ministries.seo.description} path="/ministries" />

      <PageHero
        eyebrow={content.ministries.header.eyebrow}
        title={(
          <>
            {content.ministries.header.titleLead} <span className="text-gradient">{content.ministries.header.titleHighlight}</span>
          </>
        )}
        description={content.ministries.header.description}
        image={content.ministries.header.image}
      />

      <Section spacing="compact">
        <div className="glass-chip-set mx-auto max-w-feature justify-center">
          {tags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`glass-chip min-w-11 ${activeTag === tag ? 'glass-chip-active' : ''}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </Section>

      <Section spacing="compact" className="pt-0">
        <ResponsiveGrid cols={3}>
          {visible.map((item, index) => {
            const tagStyle = ministryTagStyles[item.tag] || ministryTagStyles['Proclaim Jesus'];
            const Icon = ministryIconMap[item.iconKey] || ministryIconMap.users;
            const details = (item.details || []).slice(0, 3);

            return (
              <motion.article
                key={`${item.title}-${index}`}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.035 }}
                {...cardHover}
                className="h-full"
              >
                <GlassCard className="flex h-full flex-col p-0">
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="focus-ring flex flex-1 flex-col rounded-ds-card p-6 text-left sm:p-7"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-ds-inner border border-white/10 bg-blue-300/10 text-blue-200">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${tagStyle.text}`}
                        style={{ background: tagStyle.bg, border: `1px solid ${tagStyle.border}` }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold leading-tight text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">{item.summary}</p>
                    <dl className="mt-5 grid gap-3">
                      {details.map((detail) => (
                        <div key={detail} className="rounded-ds-inner border border-white/10 bg-white/[0.035] px-4 py-3">
                          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-blue-200/70">{getMetaLabel(detail)}</dt>
                          <dd className="mt-1 text-sm font-medium leading-6 text-white/78">{detail}</dd>
                        </div>
                      ))}
                    </dl>
                  </button>
                  <div className="border-t border-white/10 px-6 py-5 sm:px-7">
                    <MinistryAction item={item} className="w-full" />
                  </div>
                </GlassCard>
              </motion.article>
            );
          })}
        </ResponsiveGrid>
      </Section>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-md"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.985, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            >
              <GlassCard variant="feature" className="relative max-h-[86svh] w-full max-w-2xl overflow-y-auto">
                <button
                  type="button"
                  aria-label="Close ministry details"
                  onClick={() => setSelected(null)}
                  className="glass-light focus-ring absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="pr-12">
                  <span className="ds-eyebrow">{selected.tag}</span>
                  <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white">{selected.title}</h2>
                </div>
                <div className="mt-6 whitespace-pre-line text-ds-body text-white/72">{selected.body}</div>
                <dl className="mt-7 grid gap-3 sm:grid-cols-2">
                  {(selected.details || []).map((detail) => (
                    <div key={detail} className="rounded-ds-inner border border-white/10 bg-white/[0.04] px-4 py-3">
                      <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-blue-200/70">{getMetaLabel(detail)}</dt>
                      <dd className="mt-1 text-sm font-medium leading-6 text-white/80">{detail}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <MinistryAction item={selected} />
                  {selectedEmail ? (
                    <Button href={`mailto:${selectedEmail}`} variant="soft" size="sm">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedEmail}
                    </Button>
                  ) : null}
                  {selectedPhone ? (
                    <Button href={`tel:${formatPhoneHref(selectedPhone)}`} variant="soft" size="sm">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedPhone}
                    </Button>
                  ) : null}
                  <Button to="/contact" variant="ghost" size="sm">
                    Get in touch
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Section>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {content.ministries.photoStrip.map((asset, index) => (
            <ImageCard
              key={`${asset.url}-${index}`}
              src={resolveMediaSrc(asset)}
              alt={asset.alt || 'Community'}
              ratio="square"
              imgClassName="opacity-90"
            />
          ))}
        </div>
      </Section>

      <Section spacing="compact" width="feature" className="pt-0">
        <GlassCard variant="feature" className="text-center">
          <p className="ds-eyebrow">Build community</p>
          <p className="mx-auto mt-4 max-w-text text-ds-body text-white/72">
            Ministries are one way we make space for people to belong, grow, and follow Jesus together.
          </p>
          <div className="mt-7">
            <Button to="/contact" variant="soft">
              Ask about getting involved
            </Button>
          </div>
        </GlassCard>
      </Section>
    </div>
  );
}
