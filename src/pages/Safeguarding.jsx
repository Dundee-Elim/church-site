import { motion } from 'framer-motion';
import { ExternalLink, FileText, Mail, ShieldCheck } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import {
  Button,
  GlassCard,
  PageHero,
  ResponsiveGrid,
  Section,
  SectionHeader,
} from '@/components/system';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { fadeUp } from '@/lib/motion';
import { getGlobalSiteInfo } from '@/lib/siteContentUtils';
import { safeguardingResourceConfig } from '@/lib/sitePresentation';

const calmResourceIcons = {
  elim: ShieldCheck,
  report: Mail,
  policy: FileText,
};

export default function Safeguarding() {
  const { content } = useSiteContent();
  const globalInfo = getGlobalSiteInfo(content);
  const safeguardingEmail = globalInfo.safeguardingEmail || globalInfo.contactEmail || content.settings.contact.email;

  return (
    <div className="pb-20">
      <SEOHead title={content.safeguarding.seo.title} description={content.safeguarding.seo.description} path="/safeguarding" />

      <PageHero
        eyebrow={content.safeguarding.header.eyebrow}
        title={(
          <>
            {content.safeguarding.header.titleLead}<span className="text-gradient">{content.safeguarding.header.titleHighlight}</span>
          </>
        )}
        description={content.safeguarding.header.description}
        image={content.safeguarding.header.image}
      />

      <Section width="feature">
        <motion.div {...fadeUp}>
          <GlassCard variant="feature" className="overflow-hidden">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-10">
              <div className="text-center lg:text-left">
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-ds-inner border border-blue-200/15 bg-blue-300/10 text-blue-100 lg:mx-0">
                  <ShieldCheck className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-white">
                  {content.safeguarding.statement.title}
                </h2>
              </div>
              <div className="space-y-4 text-ds-body text-white/72">
                {content.safeguarding.statement.paragraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 20)}`} className={index === content.safeguarding.statement.paragraphs.length - 1 ? 'font-semibold text-white/90' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </Section>

      <Section spacing="compact" width="feature">
        <GlassCard className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="max-w-[640px]">
            <p className="ds-eyebrow">Contact</p>
            <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white">{content.safeguarding.contact.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/72 sm:text-base">{content.safeguarding.contact.description}</p>
          </div>
          <Button href={`mailto:${safeguardingEmail}`} variant="primary" className="shrink-0">
            <Mail className="h-4 w-4" />
            {content.safeguarding.contact.buttonLabel}
          </Button>
        </GlassCard>
      </Section>

      <Section>
        <SectionHeader title={content.safeguarding.resourcesTitle} description="Helpful links for policy, national guidance, and raising a concern through Elim." />
        <ResponsiveGrid cols={3} className="mt-10">
          {content.safeguarding.resources.map((resource, index) => {
            const style = safeguardingResourceConfig[resource.kind] || safeguardingResourceConfig.elim;
            const Icon = calmResourceIcons[resource.kind] || style.Icon || ShieldCheck;

            return (
              <motion.div key={`${resource.kind}-${index}`} {...fadeUp} transition={{ delay: index * 0.06, duration: 0.42 }}>
                <GlassCard className="flex h-full flex-col">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-ds-inner border border-white/10 bg-blue-300/10 text-blue-200">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold leading-tight text-white">{resource.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-white/70">{resource.description}</p>
                  <Button href={resource.ctaUrl} target="_blank" rel="noreferrer" variant={resource.kind === 'elim' ? 'primary' : 'soft'} size="sm" className="mt-6 self-start">
                    {resource.ctaLabel}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </GlassCard>
              </motion.div>
            );
          })}
        </ResponsiveGrid>
      </Section>
    </div>
  );
}
