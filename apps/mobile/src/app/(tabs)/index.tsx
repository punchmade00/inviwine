import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCellarStore } from '@/store/cellarStore';
import { useAuthStore } from '@/store/authStore';
import { useMarketStore } from '@/store/marketStore';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { formatPrice, formatPct, getPctColor } from '@/lib/utils';

const TimeFilters = ['1W', '1M', '1Y', 'ALL'];

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { holdings, totalValue, totalCost, pnl, pnlPct, fetchHoldings, loading } = useCellarStore();
  const { topGainers, topLosers } = useMarketStore();
  const [timeFilter, setTimeFilter] = useState('1M');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) fetchHoldings(user.id);
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) await fetchHoldings(user.id);
    setRefreshing(false);
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </View>

      {/* Portfolio Value Card */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.portfolioCard}>
        <Text style={styles.portfolioLabel}>Valeur de ma cave</Text>
        <Text style={styles.portfolioValue}>{formatPrice(totalValue)}</Text>
        <View style={styles.pnlRow}>
          <Text style={[styles.pnl, { color: getPctColor(pnl) }]}>
            {pnl >= 0 ? '+' : ''}{formatPrice(pnl)}
          </Text>
          <View style={[styles.pnlBadge, { backgroundColor: pnlPct >= 0 ? Colors.positive + '22' : Colors.negative + '22' }]}>
            <Text style={[styles.pnlBadgeText, { color: getPctColor(pnlPct) }]}>{formatPct(pnlPct)}</Text>
          </View>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Investi : {formatPrice(totalCost)}</Text>
        </View>
      </Animated.View>

      {/* Time filters */}
      <View style={styles.filters}>
        {TimeFilters.map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, timeFilter === f && styles.filterActive]} onPress={() => setTimeFilter(f)}>
            <Text style={[styles.filterText, timeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mini chart placeholder */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.chartCard}>
        <View style={styles.chartPlaceholder}>
          <Text style={{ color: Colors.textMuted, fontSize: Typography.sm }}>📈 Graphique chargé dans l'app complète</Text>
        </View>
      </Animated.View>

      {/* Stats row */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{holdings.length}</Text>
          <Text style={styles.statLabel}>Positions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: getPctColor(pnlPct) }]}>{formatPct(pnlPct)}</Text>
          <Text style={styles.statLabel}>Performance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatPrice(totalValue / (holdings.length || 1))}</Text>
          <Text style={styles.statLabel}>Moy/bouteille</Text>
        </View>
      </Animated.View>

      {/* Top Gainers */}
      {topGainers.length > 0 && (
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Top Hausses</Text>
          {topGainers.slice(0, 3).map(w => (
            <View key={w.id} style={styles.moverRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.moverName} numberOfLines={1}>{w.name} {w.vintage}</Text>
                <Text style={styles.moverDomain}>{w.domain}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.moverPrice}>{formatPrice(w.current_price)}</Text>
                <Text style={[styles.moverPct, { color: Colors.positive }]}>{formatPct(w.price_change_pct)}</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Top Losers */}
      {topLosers.length > 0 && (
        <Animated.View entering={FadeInDown.delay(500).springify()} style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>📉 Top Baisses</Text>
          {topLosers.slice(0, 3).map(w => (
            <View key={w.id} style={styles.moverRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.moverName} numberOfLines={1}>{w.name} {w.vintage}</Text>
                <Text style={styles.moverDomain}>{w.domain}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.moverPrice}>{formatPrice(w.current_price)}</Text>
                <Text style={[styles.moverPct, { color: Colors.negative }]}>{formatPct(w.price_change_pct)}</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  greeting: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.text },
  date: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  portfolioCard: { margin: 16, backgroundColor: Colors.bg1, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: Colors.border },
  portfolioLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  portfolioValue: { fontSize: Typography['4xl'], fontWeight: Typography.black, color: Colors.text, marginTop: 8, letterSpacing: Typography.tight },
  pnlRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  pnl: { fontSize: Typography.lg, fontWeight: Typography.semibold },
  pnlBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pnlBadgeText: { fontSize: Typography.sm, fontWeight: Typography.bold },
  costRow: { marginTop: 8 },
  costLabel: { fontSize: Typography.sm, color: Colors.textMuted },
  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bg2 },
  filterActive: { backgroundColor: Colors.primary },
  filterText: { color: Colors.textMuted, fontSize: Typography.sm, fontWeight: Typography.semibold },
  filterTextActive: { color: Colors.text },
  chartCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  chartPlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: Colors.bg1, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 4 },
  statValue: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  section: { marginHorizontal: 16, marginBottom: 16, backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text, marginBottom: 12 },
  moverRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  moverName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.text },
  moverDomain: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  moverPrice: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.text },
  moverPct: { fontSize: Typography.xs, fontWeight: Typography.bold, marginTop: 2 },
});