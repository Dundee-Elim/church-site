import { motion } from 'framer-motion';
import { Bus, Car, CheckCircle2, MapPin } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import {
  Button,
  GlassCard,
  ImageCard,
  PageHero,
  ResponsiveGrid,
  Section,
  SectionHeader,
} from '@/components/system';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { fadeRight, fadeUp } from '@/lib/motion';
import { getGlobalSiteInfo, resolveMediaSrc } from '@/lib/siteContentUtils';
import { aboutTravelConfig } from '@/lib/sitePresentation';

const travelFallbackIcons = { address: MapPin, car: Car, bus: Bus };

function dedupeSentences(parts) {
  const seen = new Set();

  return parts
    .filter(Boolean)
    .flatMap((part) => String(part).match(/[^.!?]+[.!?]?/g) || [])
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence) => {
      const key = sentence.toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]$/, '');

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .join(' ');
}

export default function About() {
  const { content } = useSiteContent();
  const globalInfo = getGlobalSiteInfo(content);
  const expectationNote = dedupeSentences([globalInfo.communionNote, content.about.sundayExpectations.note]);
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

      <PageHero
        eyebrow={content.about.header.eyebrow}
        title={(
          <>
            {content.about.header.titleLead} <span className="text-gradient">{content.about.header.titleHighlight}</span>
          </>
        )}
        description={content.about.header.description}
        image={content.about.header.image}
      />

      <Section>
        <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <motion.div {...fadeUp} className="mx-auto w-full max-w-[520px] lg:max-w-none">
            <ImageCard
              src={resolveMediaSrc(content.about.pastors.image)}
              alt={content.about.pastors.image.alt || 'Pastors'}
              ratio="portrait"
              className="mx-auto max-h-[640px]"
              imgClassName="object-[center_18%]"
            />
          </motion.div>
          <motion.div {...fadeRight} className="mx-auto max-w-text text-center lg:text-left">
            <p className="ds-eyebrow">{content.about.pastors.eyebrow}</p>
            <h2 className="ds-section-title">
              {content.about.pastors.titleLead}
              <br />
              <span className="text-gradient">{content.about.pastors.titleHighlight}</span>
            </h2>
            <div className="mt-6 space-y-4 text-ds-body text-white/72">
              {content.about.pastors.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      <Section spacing="compact" width="feature">
        <GlassCard variant="feature" className="overflow-hidden text-center">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="ds-eyebrow">Vision & Mission</p>
          <h2 className="mx-auto mt-4 max-w-[760px] font-display text-[2rem] font-bold leading-[1.12] text-white sm:text-[2.55rem] lg:text-[2.9rem]">
            To see the people of Dundee transformed by Jesus.
          </h2>
          <p className="mx-auto mt-5 max-w-text text-ds-body text-white/72">
            We live this out through three simple commitments that shape our worship, our community, and our service in the city.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['Proclaim Jesus', 'Build Community', 'Serve the City'].map((pillar) => (
              <div key={pillar} className="rounded-ds-inner border border-white/10 bg-white/[0.04] px-5 py-5">
                <CheckCircle2 className="mx-auto mb-3 h-5 w-5 text-blue-200" aria-hidden="true" />
                <h3 className="font-display text-xl font-semibold text-white">{pillar}</h3>
              </div>
            ))}
          </div>
        </GlassCard>
      </Section>

      <Section>
        <SectionHeader
          title={content.about.sundayExpectations.title}
          description={content.about.sundayExpectations.description}
        />
        <ResponsiveGrid cols={3} className="mt-10">
          {content.about.sundayExpectations.items.map((item) => (
            <motion.div key={item.number} {...fadeUp}>
              <GlassCard className="flex h-full flex-col">
                <div className="mb-5 flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-200/15 bg-blue-300/10 font-display text-lg font-bold text-blue-100">
                    {item.number}
                  </span>
                  <h3 className="font-display text-xl font-bold leading-tight text-white">{item.title}</h3>
                </div>
                <p className="text-sm leading-7 text-white/70 sm:text-base">{item.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </ResponsiveGrid>
        {expectationNote ? (
          <GlassCard className="mx-auto mt-6 max-w-feature text-center">
            <p className="text-sm leading-7 text-white/72 sm:text-base">
              <span className="font-semibold text-blue-200">Note:</span> {expectationNote}
            </p>
          </GlassCard>
        ) : null}
      </Section>

      <Section spacing="compact">
        <SectionHeader title={content.about.gettingHere.title} />
        <ResponsiveGrid cols={3} className="mt-9">
          {gettingHereCards.map((card) => {
            const style = aboutTravelConfig[card.kind] || aboutTravelConfig.address;
            const Icon = style.Icon || travelFallbackIcons[card.kind] || MapPin;

            return (
              <GlassCard key={card.title} className="flex h-full flex-col">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-ds-inner border border-white/10 bg-blue-300/10 text-blue-200">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-white">{card.title}</h3>
                <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-7 text-white/70">{card.description}</p>
                {card.linkLabel && card.linkUrl ? (
                  <Button href={card.linkUrl} target="_blank" rel="noreferrer" variant="soft" size="sm" className="mt-5 self-start">
                    {card.linkLabel}
                  </Button>
                ) : null}
              </GlassCard>
            );
          })}
        </ResponsiveGrid>
        {globalInfo.parking.parkingChargesUrl ? (
          <div className="mt-6 text-center">
            <Button href={globalInfo.parking.parkingChargesUrl} target="_blank" rel="noreferrer" variant="soft" size="sm">
              Dundee City Council parking charges
            </Button>
          </div>
        ) : null}
        <div className="mt-8 overflow-hidden rounded-ds-feature border border-white/10 bg-white/[0.04] p-1 shadow-2xl shadow-black/30">
          <iframe
            src={content.about.gettingHere.mapEmbedUrl || content.settings.links.mapsEmbedUrl}
            className="h-72 w-full rounded-[calc(var(--ds-radius-feature)-0.35rem)] sm:h-80"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Church Location"
          />
        </div>
      </Section>

      <Section width="feature">
        <GlassCard variant="feature" className="text-center">
          <p className="ds-eyebrow">Elim Network</p>
          <h2 className="ds-section-title">{content.about.network.title}</h2>
          <p className="mx-auto mt-4 max-w-text text-ds-body text-white/72">{content.about.network.description}</p>
          <Button href={content.about.network.linkUrl} target="_blank" rel="noreferrer" variant="soft" className="mt-7">
            {content.about.network.linkLabel}
          </Button>
        </GlassCard>
      </Section>
    </div>
  );
}
