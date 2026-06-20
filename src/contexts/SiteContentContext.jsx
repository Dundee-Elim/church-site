import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSiteContent } from '@/content/defaultSiteContent';
import { safeParseSiteContent } from '@/content/siteContentSchema';
import { fetchPublishedContent } from '@/lib/siteContentApi';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

const SiteContentContext = createContext(null);
const CONTENT_CACHE_KEY = 'dundee-elim:published-content-cache:v1';

function readCachedPublishedContent() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CONTENT_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const validated = safeParseSiteContent(parsed?.content);

    if (!validated.success) {
      return null;
    }

    return {
      content: validated.data,
      metadata: parsed?.metadata || null,
    };
  } catch {
    return null;
  }
}

function writeCachedPublishedContent(content, metadata) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify({
      content,
      metadata,
      cachedAt: new Date().toISOString(),
    }));
  } catch {
    // Ignore cache write failures.
  }
}

export function SiteContentProvider({ children }) {
  const cached = isSupabaseConfigured ? readCachedPublishedContent() : null;
  const [content, setContent] = useState(cached?.content || defaultSiteContent);
  const [metadata, setMetadata] = useState(cached?.metadata || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(() => {
    if (!isSupabaseConfigured) {
      return 'fallback';
    }

    return cached ? 'cache' : 'loading';
  });

  async function refreshContent() {
    setLoading(true);

    const result = await fetchPublishedContent();

    setContent(result.content);
    setMetadata(result.metadata);
    setError(result.error);
    setSource(result.source);

    if (result.source === 'supabase') {
      writeCachedPublishedContent(result.content, result.metadata);
    }

    setLoading(false);
  }

  useEffect(() => {
    refreshContent();
  }, []);

  const value = useMemo(() => ({
    content,
    metadata,
    loading,
    error,
    source,
    refreshContent,
  }), [content, metadata, loading, error, source]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);

  if (!context) {
    throw new Error('useSiteContent must be used inside SiteContentProvider.');
  }

  return context;
}
