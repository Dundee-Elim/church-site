import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      setAdminChecked(true);
      return undefined;
    }

    let active = true;

    async function resolveAdmin(nextSession) {
      if (!nextSession?.user) {
        if (active) {
          setIsAdmin(false);
          setAdminChecked(true);
        }
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');

        if (!active) {
          return;
        }

        setIsAdmin(!error && Boolean(data));
      } catch {
        if (active) {
          setIsAdmin(false);
        }
      } finally {
        if (active) {
          setAdminChecked(true);
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }

      const nextSession = data.session || null;
      setSession(nextSession);
      setUser(nextSession?.user || null);
      setLoading(false);
      setAdminChecked(false);
      resolveAdmin(nextSession);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setUser(nextSession?.user || null);
      setLoading(false);
      setAdminChecked(false);
      resolveAdmin(nextSession || null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    if (!supabase) {
      throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();

    setIsAdmin(false);
    setAdminChecked(true);

    if (error) {
      throw error;
    }
  }

  const value = useMemo(() => ({
    session,
    user,
    loading,
    isConfigured: isSupabaseConfigured,
    isAuthenticated: Boolean(session?.user),
    isAdmin,
    adminChecked,
    signIn,
    signOut,
  }), [session, user, loading, isAdmin, adminChecked]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider.');
  }

  return context;
}
