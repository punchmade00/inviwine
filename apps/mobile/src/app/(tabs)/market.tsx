import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useMarketStore } from '@/store/marketStore';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { formatPrice, formatPct, getPctColor, getColorDot } from '@/lib/utils';
import type { Wine } from '@/types';

export default function MarketScreen() {
  const { user } = useAuthStore();
  const { isPremium } = useSubscriptionStore();
  const { wines, topGainers, topLosers, trending, loading, search, setSearch, fetchWines, fetchWatchlist, toggleWatchlist, watchlist } = useMarketStore();
  const [activeSection, setActiveSection] = useState<'all' | 'gainers' | 'losers' | 'trending'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWines();
    if (user) { fetchWatchlist(user.id); }
  }, [user]);

  const onRefresh = async () => { setRefreshing(true); await fetchWines(); setRefreshing(false); };
  const onSearch = (t: string) => { setSearch(t); fetchWines(); };

  const displayWines = activeSection === 'gainers' ? topGainers : activeSection === 'losers' ? topLosers : activeSection === 'trending' ? trending : wines;

  const renderWine = ({ item, index }: { item: Wine; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <TouchableOpacity style={styles.wineRow} onPress={() => router.push({ pathname: '/(tabs)/market', params: { wineId: item.id } } as any)} activeOpacity={0.7}>
        <View style={[styles.colorDot, { backgroundColor: getColorDot(item.color) }]} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.wineName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.wineInfo}>{item.domain} · {item.vintage}</Text>
          <Text style={styles.wineAppellation}>{item.appellation}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.winePrice}>{formatPrice(item.current_price)}</Text>
          <View style={[styles.badge, { backgroundColor: item.price_change_pct >= 0 ? Colors.positive + '22' : Colors.negative + '22' }]}>
            <Text style={[styles.badgeText, { color: getPctColor(item.price_change_pct) }]}>{formatPct(item.price_change_pct)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marché</Text>
        <TextInput style={styles.search} placeholder="Rechercher un vin..." placeholderTextColor={Colors.textMuted} value={search} onChangeText={onSearch} />
      </View>

      <View style={styles.sections}>
        {(['all', 'gainers', 'losers', 'trending'] as const).map(s => (
          <TouchableOpacity key={s} style={[styles.sectionBtn, activeSection === s && styles.sectionActive]} onPress={() => setActiveSection(s)}>
            <Text style={[styles.sectionText, activeSection === s && styles.sectionTextActive]}>
              {s === 'all' ? 'Tous' : s === 'gainers' ? '🚀 Hausses' : s === 'losers' ? '📉 Baisses' : '🔥 Tendances'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayWines}
        keyExtractor={i => i.id}
        renderItem={renderWine}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Chargement...' : 'Aucun résultat'}</Text>}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 60 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.text, marginBottom: 16 },
  search: { backgroundColor: Colors.bg2, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: Colors.text, fontSize: Typography.base, borderWidth: 1, borderColor: Colors.border },
  sections: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  sectionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bg2 },
  sectionActive: { backgroundColor: Colors.primary },
  sectionText: { color: Colors.textMuted, fontSize: Typography.xs, fontWeight: Typography.semibold },
  sectionTextActive: { color: Colors.text },
  wineRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.bg0 },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  wineName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.text },
  wineInfo: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  wineAppellation: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  winePrice: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.text },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  badgeText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  empty: { textAlign: 'center', color: Colors.textMuted, padding: 40, fontSize: Typography.base },
});