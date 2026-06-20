import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, CheckCircle, Send } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Section, GlassCard } from '@/components/system';
import { openMailto } from '@/lib/mailto';
import { createPrayerSubmission } from '@/lib/siteContentApi';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { getGlobalSiteInfo } from '@/lib/siteContentUtils';
import { fadeUp, subtleTap } from '@/lib/motion';

const inputClass = "glass-input-field";

export default function PrayerRequestForm() {
  const { content } = useSiteContent();
  const globalInfo = getGlobalSiteInfo(content);
  const [form, setForm] = useState({ name: '', email: '', request: '', is_private: false });
  // Honeypot: kept empty by real users; bots tend to fill every field.
  const [botField, setBotField] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Silently drop suspected spam without tipping off the bot.
    if (botField.trim()) {
      setSubmitted(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSupabaseConfigured) {
        await createPrayerSubmission(form);
      } else {
        openMailto({
          to: globalInfo.contactEmail || content.settings.contact.email,
          subject: form.is_private ? 'Private prayer request from website' : 'Prayer request from website',
          body: [
            `Name: ${form.name}`,
            `Email: ${form.email || 'Not provided'}`,
            `Private request: ${form.is_private ? 'Yes' : 'No'}`,
            '',
            form.request,
          ].join('\n'),
        });
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Unable to send prayer request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section width="feature">
      <motion.div {...fadeUp}>
        <GlassCard variant="feature">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-ds-inner border border-white/10 bg-violet-400/14 text-violet-200">
              <Heart className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="ds-eyebrow text-violet-200/80">{content.home.prayerRequest.eyebrow}</p>
              <h2 className="mt-1 font-display text-ds-section font-bold text-white">{content.home.prayerRequest.title}</h2>
            </div>
          </div>
          <p className="mx-auto mt-4 max-w-text text-center text-ds-body text-white/72 sm:mx-0 sm:text-left">
            {content.home.prayerRequest.description}
          </p>

          <div className="mt-8">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <div className="mb-4 rounded-full p-4" style={{ background: 'rgba(34,197,94,0.15)' }}>
                    <CheckCircle className="h-10 w-10 text-green-400" />
                  </div>
                  <h3 className="mb-2 font-display text-2xl font-bold text-white">{content.home.prayerRequest.successTitle}</h3>
                  <p className="text-ds-body text-white/60">{content.home.prayerRequest.successDescription}</p>
                  <motion.button
                    {...subtleTap}
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', request: '', is_private: false }); }}
                    className="glass-action-soft focus-ring mt-6 px-5 text-sm text-violet-200 hover:text-white"
                  >
                    {content.home.prayerRequest.resetLabel}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-4">
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="prayer-company">Company (leave blank)</label>
                    <input
                      id="prayer-company"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={botField}
                      onChange={e => setBotField(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="prayer-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">Your Name *</label>
                      <input required type="text" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        id="prayer-name" placeholder="First name is fine" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="prayer-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">Email (optional)</label>
                      <input type="email" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        id="prayer-email" placeholder="For a personal response" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="prayer-request" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">Your Prayer Request *</label>
                    <textarea required rows={4} value={form.request}
                      onChange={e => setForm({ ...form, request: e.target.value })}
                      id="prayer-request" placeholder="Share what's on your heart..." className={inputClass} />
                  </div>

                  <button type="button" aria-pressed={form.is_private} onClick={() => setForm({ ...form, is_private: !form.is_private })}
                    className="glass-inline-panel focus-ring flex w-full items-center gap-3 px-4 py-3 text-left transition-all"
                    style={form.is_private
                      ? { background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }
                      : undefined}>
                    <Lock className={`h-4 w-4 shrink-0 ${form.is_private ? 'text-violet-300' : 'text-white/55'}`} />
                    <div>
                      <div className={`text-sm font-medium ${form.is_private ? 'text-white' : 'text-white/60'}`}>{content.home.prayerRequest.privacyLabel}</div>
                      <div className="mt-0.5 text-xs text-white/55">{content.home.prayerRequest.privacyDescription}</div>
                    </div>
                    <div className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${form.is_private ? 'border-violet-400 bg-violet-400' : 'border-white/20'}`}>
                      {form.is_private && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </button>

                  {error && (
                    <div className="rounded-[1.1rem] px-4 py-3 text-sm text-red-200" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {error}
                    </div>
                  )}

                  <motion.button {...subtleTap} type="submit" disabled={loading}
                    className="lg-btn-primary focus-ring w-full disabled:opacity-50">
                    <Send className="h-4 w-4" />
                    {loading ? 'Sending...' : content.home.prayerRequest.submitLabel}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>
    </Section>
  );
}
