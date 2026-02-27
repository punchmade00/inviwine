import { create } from 'zustand';
import { supabase, FUNCTIONS_URL } from '@/lib/supabase';

interface SubscriptionState {
  status: string; isPremium: boolean;
  fetchSubscription: (userId: string) => Promise<void>;
  createCheckoutSession: () => Promise<{ url: string | null; error: string | null }>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  status: 'free', isPremium: false,
  fetchSubscription: async (userId) => {
    const { data } = await supabase.from('subscriptions').select('status').eq('user_id', userId).single();
    const isPremium = data?.status === 'active' || data?.status === 'trialing';
    set({ status: data?.status ?? 'free', isPremium });
  },
  createCheckoutSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { url: null, error: 'Non connecté' };
    try {
      const res = await fetch(`${FUNCTIONS_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ success_url: 'inviwine://premium-success', cancel_url: 'inviwine://premium-cancel' }),
      });
      const data = await res.json();
      return { url: data.url ?? null, error: data.error ?? null };
    } catch (e: any) { return { url: null, error: e.message }; }
  },
}));