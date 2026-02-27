import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Holding } from '@/types';

interface CellarState {
  holdings: Holding[]; loading: boolean;
  totalValue: number; totalCost: number; pnl: number; pnlPct: number;
  fetchHoldings: (userId: string) => Promise<void>;
  addHolding: (data: any, userId: string) => Promise<{ error: string | null }>;
  deleteHolding: (id: string) => Promise<void>;
}

export const useCellarStore = create<CellarState>((set) => ({
  holdings: [], loading: false,
  totalValue: 0, totalCost: 0, pnl: 0, pnlPct: 0,

  fetchHoldings: async (userId) => {
    set({ loading: true });
    const { data } = await supabase.from('holdings').select('*, wine:wines(*)').eq('user_id', userId);
    const holdings = (data || []).map((h: any) => {
      const cp = h.wine?.current_price || h.purchase_price;
      const cv = h.quantity * cp;
      const cb = h.quantity * h.purchase_price;
      return { ...h, current_value: cv, pnl: cv - cb, pnl_pct: cb > 0 ? ((cv - cb) / cb * 100) : 0 };
    });
    const totalValue = holdings.reduce((s: number, h: any) => s + (h.current_value || 0), 0);
    const totalCost = holdings.reduce((s: number, h: any) => s + h.quantity * h.purchase_price, 0);
    const pnl = totalValue - totalCost;
    set({ holdings, totalValue, totalCost, pnl, pnlPct: totalCost > 0 ? (pnl / totalCost * 100) : 0, loading: false });
  },

  addHolding: async (data, userId) => {
    const { error } = await supabase.from('holdings').insert({ ...data, user_id: userId });
    return { error: error?.message ?? null };
  },

  deleteHolding: async (id) => { await supabase.from('holdings').delete().eq('id', id); },
}));