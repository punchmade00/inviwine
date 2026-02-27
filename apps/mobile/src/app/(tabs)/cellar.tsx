import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCellarStore } from '@/store/cellarStore';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { formatPrice, formatPct, getPctColor, getColorDot } from '@/lib/utils';
import type { Holding } from '@/types';

export default function CellarScreen() {
  const { user } = useAuthStore();
  const { holdings, totalValue, totalCost, pnl, pnlPct, fetchHoldings, deleteHolding, loading } = useCellarStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (user) fetchHoldings(user.id); }, [user]);

  const onRefresh = async () => { setRefreshing(true); if (user) await fetchHoldings(user.id); setRefreshing(false); };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Supprimer', `Supprimer ${name} de votre cave ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteHolding(id); if (user) fetchHoldings(user.id); } },
    ]);
  };

  const renderHolding = ({ item, index }: { item: Holding; index: number }) => {
    const wine = (item as any).wine;
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id, wine?.name || 'ce vin')} activeOpacity={0.8}>
          <View style={styles.cardHeader}>
            <View style={[styles.colorDot, { backgroundColor: getColorDot(wine?.color || 'rouge') }]} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.wineName} numberOfLines={1}>{wine?.name || 'Vin inconnu'}</Text>
              <Text style={styles.wineInfo}>{wine?.domain} · {wine?.vintage}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.currentValue}>{formatPrice(item.current_value || 0)}</Text>
              <View style={[styles.pnlBadge, { backgroundColor: (item.pnl_pct || 0) >= 0 ? Colors.positive + '22' : Colors.negative + '22' }]}>
                <Text style={[styles.pnlText, { color: getPctColor(item.pnl_pct || 0) }]}>{formatPct(item.pnl_pct || 0)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>{item.quantity} bouteille{item.quantity > 1 ? 's' : ''}</Text>
            <Text style={styles.footerText}>Prix achat : {formatPrice(item.purchase_price)}/bt</Text>
            <Text style={[styles.footerText, { color: getPctColor(item.pnl || 0) }]}>P&L : {item.pnl && item.pnl >= 0 ? '+' : ''}{formatPrice(item.pnl || 0)}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ma Cave</Text>
        {holdings.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatPrice(totalValue)}</Text>
              <Text style={styles.summaryLabel}>Valeur totale</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: getPctColor(pnl) }]}>{pnl >= 0 ? '+' : ''}{formatPrice(pnl)}</Text>
              <Text style={styles.summaryLabel}>P&L total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: getPctColor(pnlPct) }]}>{formatPct(pnlPct)}</Text>
              <Text style={styles.summaryLabel}>Performance</Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={holdings}
        keyExtractor={i => i.id}
        renderItem={renderHolding}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, textAlign: 'center' }}>🍾</Text>
            <Text style={styles.emptyTitle}>Cave vide</Text>
            <Text style={styles.emptyText}>Explorez le marché et ajoutez vos premières positions.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.text, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },
  summaryLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: Colors.border },
  card: { backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginTop: 2 },
  wineName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.text },
  wineInfo: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  currentValue: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },
  pnlBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  pnlText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  footerText: { fontSize: Typography.xs, color: Colors.textSecondary },
  empty: { padding: 40, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text, textAlign: 'center' },
  emptyText: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center' },
});