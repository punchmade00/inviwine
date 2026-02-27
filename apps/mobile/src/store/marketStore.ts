import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Wine, PricePoint, Offer } from '@/types';

interface MarketState {
  wines: Wine[]; topGainers: Wine[]; topLosers: Wine[]; trending: Wine[];
  loading: boolean; search: string;
  selectedWine: Wine | null; priceHistory: PricePoint[]; offers: Offer[];
  watchlist: string[];
  fetchWines: (filters?: any) => Promise<void>;
  fetchWineDetail: (id: string) => Promise<void>;
  setSearch: (s: string) => void;
  toggleWatchlist: (wineId: string, userId: string, isPremium: boolean) => Promise<boolean>;
  fetchWatchlist: (userId: string) => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  wines: [], topGainers: [], topLosers: [], trending: [],
  loading: false, search: '',
  selectedWine: null, priceHistory: [], offers: [], watchlist: [],

  fetchWines: async (filters = {}) => {
    set({ loading: true });
    const { search } = get();
    let q = supabase.from('wines').select('*');
    if (search) q = q.or(`name.ilike.%${search}%,domain.ilike.%${search}%`);
    if (filters.region) q = q.eq('region', filters.region);
    if (filters.color) q = q.eq('color', filters.color);
    const { data } = await q.order('volume_score', { ascending: false }).limit(100);
    const all = data || [];
    const byChange = [...all].sort((a, b) => b.price_change_pct - a.price_change_pct);
    set({
      wines: all,
      topGainers: byChange.filter(w => w.price_change_pct > 0).slice(0, 5),
      topLosers: [...byChange].reverse().filter(w => w.price_change_pct < 0).slice(0, 5),
      trending: all.filter(w => w.volume_score > 75).slice(0, 10),
      loading: false,
    });
  },

  fetchWineDetail: async (id) => {
    const [{ data: wine }, { data: history }, { data: offers }] = await Promise.all([
      supabase.from('wines').select('*').eq('id', id).single(),
      supabase.from('price_points').select('*').eq('wine_id', id).order('ts', { ascending: true }).limit(365),
      supabase.from('offers').select('*').eq('wine_id', id).order('price'),
    ]);
    set({ selectedWine: wine, priceHistory: history || [], offers: offers || [] });
  },

  setSearch: (s) => set({ search: s }),

  toggleWatchlist: async (wineId, userId, isPremium) => {
    const { watchlist } = get();
    if (watchlist.includes(wineId)) {
      await supabase.from('watchlist').delete().eq('user_id', userId).eq('wine_id', wineId);
      set({ watchlist: watchlist.filter(id => id !== wineId) });
      return false;
    }
    if (!isPremium && watchlist.length >= 3) return false;
    const { error } = await supabase.from('watchlist').insert({ user_id: userId, wine_id: wineId });
    if (!error) set({ watchlist: [...watchlist, wineId] });
    return !error;
  },

  fetchWatchlist: async (userId) => {
    const { data } = await supabase.from('watchlist').select('wine_id').eq('user_id', userId);
    set({ watchlist: (data || []).map((w: any) => w.wine_id) });
  },
}));