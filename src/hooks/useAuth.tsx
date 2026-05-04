/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigError } from '../lib/supabaseClient';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  authorized: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) {
      setAuthorized(false);
      setCheckingAccess(false);
      return;
    }

    let active = true;
    setCheckingAccess(true);

    async function checkAccess() {
      try {
        const { data, error } = await supabase!.rpc('is_authorized_user');
        if (!active) return;

        if (error) {
          const message = error.message.toLowerCase();
          setAuthorized(message.includes('is_authorized_user') ? true : false);
          return;
        }

        setAuthorized(Boolean(data));
      } finally {
        if (active) setCheckingAccess(false);
      }
    }

    void checkAccess();

    return () => {
      active = false;
    };
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      authorized,
      loading: loading || checkingAccess,
      async signIn(email, password) {
        if (!supabase) throw new Error(supabaseConfigError ?? 'Supabase no esta configurado.');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signOut() {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [authorized, checkingAccess, loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
