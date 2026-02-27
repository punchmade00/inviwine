import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { formatPrice } from '@/lib/utils';

export default function AlertsScreen() {
  const { user } = useAuthStore();
  const { isPremium } = useSubscriptionStore();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('alerts').select('*, wine:wines(name, current_price)').eq('user_id', user.id).order('created_at', { ascending: false });
    setAlerts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [user]);
  const onRefresh = async () => { setRefreshing(true); await fetchAlerts(); setRefreshing(false); };

  const deleteAlert = async (id: string) => {
    await supabase.from('alerts').delete().eq('id', id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const typeLabel = (type: string) => {
    if (type === 'price_above') return '📈 Prix au-dessus de';
    if (type === 'price_below') return '📉 Prix en-dessous de';
    return '⚡ Variation de';
  };

  if (!isPremium) return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Alertes</Text></View>
      <View style={styles.paywall}>
        <Text style={{ fontSize: 48, textAlign: 'center' }}>🔔</Text>
        <Text style={styles.paywallTitle}>Fonctionnalité Premium</Text>
        <Text style={styles.paywallText}>Les alertes prix sont réservées aux abonnés Premium. Soyez notifié dès qu'un vin atteint votre cible.</Text>
        <TouchableOpacity style={styles.upgradeBtn}><Text style={styles.upgradeBtnText}>Passer Premium — 9,99€/mois</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alertes</Text>
        <Text style={styles.subtitle}>{alerts.filter(a => !a.triggered).length} alerte{alerts.length !== 1 ? 's' : ''} active{alerts.length !== 1 ? 's' : ''}</Text>
      </View>
      <FlatList
        data={alerts}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <View style={[styles.alertCard, item.triggered && styles.alertTriggered]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertWine} numberOfLines={1}>{item.wine?.name}</Text>
                <Text style={styles.alertType}>{typeLabel(item.type)} {formatPrice(item.threshold)}</Text>
                <Text style={styles.alertCurrent}>Prix actuel : {formatPrice(item.wine?.current_price || 0)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                {item.triggered ? (
                  <View style={styles.triggeredBadge}><Text style={styles.triggeredText}>Déclenchée ✓</Text></View>
                ) : (
                  <View style={styles.activeBadge}><Text style={styles.activeText}>Active</Text></View>
                )}
                <TouchableOpacity onPress={() => deleteAlert(item.id)}>
                  <Text style={{ color: Colors.negative, fontSize: Typography.xs }}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, textAlign: 'center' }}>🔔</Text>
            <Text style={styles.emptyTitle}>Aucune alerte</Text>
            <Text style={styles.emptyText}>Créez des alertes depuis la fiche d'un vin sur le marché.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.text },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4 },
  alertCard: { backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row' },
  alertTriggered: { borderColor: Colors.positive + '44', backgroundColor: Colors.positive + '0A' },
  alertWine: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.text },
  alertType: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 4 },
  alertCurrent: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  triggeredBadge: { backgroundColor: Colors.positive + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  triggeredText: { color: Colors.positive, fontSize: Typography.xs, fontWeight: Typography.bold },
  activeBadge: { backgroundColor: Colors.primaryLight + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  activeText: { color: Colors.primaryLight, fontSize: Typography.xs, fontWeight: Typography.bold },
  paywall: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  paywallTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text, textAlign: 'center' },
  paywallText: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  upgradeBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24 },
  upgradeBtnText: { color: Colors.text, fontWeight: Typography.bold, fontSize: Typography.base },
  empty: { padding: 40, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text },
  emptyText: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center' },
});