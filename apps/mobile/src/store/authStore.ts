import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null; user: User | null; loading: boolean;
  setSession: (s: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null, user: null, loading: true,
  setSession: (session) => set({ session, user: session?.user ?? null, loading: false }),
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },
  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  },
  signOut: async () => { await supabase.auth.signOut(); set({ session: null, user: null }); },
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'inviwine://reset-password' });
    return { error: error?.message ?? null };
  },
}));