export interface Wine {
  id: string; name: string; domain: string; appellation: string; region: string;
  color: 'rouge' | 'blanc' | 'rosé' | 'champagne'; vintage: number;
  current_price: number; price_change_pct: number; price_change_1w: number;
  price_change_1m: number; price_change_1y: number; volume_score: number;
  confidence_score: number; volatility: number; spread: number;
  description?: string; created_at: string; updated_at: string;
}
export interface PricePoint { id: string; wine_id: string; price: number; ts: string; source: string; }
export interface Offer { id: string; wine_id: string; merchant_name: string; merchant_url: string; price: number; availability: 'in_stock' | 'limited' | 'out_of_stock'; updated_at: string; }
export interface Holding { id: string; user_id: string; wine_id: string; quantity: number; purchase_price: number; purchase_date: string; notes?: string; created_at: string; wine?: Wine; current_value?: number; pnl?: number; pnl_pct?: number; }
export interface Subscription { id: string; user_id: string; stripe_customer_id?: string; stripe_subscription_id?: string; status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'free'; current_period_end?: string; }
export interface Alert { id: string; user_id: string; wine_id: string; type: 'price_above' | 'price_below' | 'change_pct'; threshold: number; triggered: boolean; triggered_at?: string; sent: boolean; created_at: string; wine?: Wine; }
export interface WatchlistItem { id: string; user_id: string; wine_id: string; created_at: string; wine?: Wine; }
export type TimeFilter = '1W' | '1M' | '1Y' | 'ALL';