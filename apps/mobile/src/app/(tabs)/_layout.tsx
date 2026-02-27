import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  const { session, loading } = useAuthStore();
  useEffect(() => {
    if (!loading && !session) router.replace('/(auth)/login');
  }, [session, loading]);

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#111118', borderTopColor: '#2A2A3A', borderTopWidth: 1, paddingBottom: 8, height: 88 },
      tabBarActiveTintColor: Colors.primaryLight,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginTop: 2 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={22} color={color} /> }} />
      <Tabs.Screen name="market" options={{ title: 'Marché', tabBarIcon: ({ color }) => <Ionicons name="wine" size={22} color={color} /> }} />
      <Tabs.Screen name="cellar" options={{ title: 'Cave', tabBarIcon: ({ color }) => <Ionicons name="grid" size={22} color={color} /> }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alertes', tabBarIcon: ({ color }) => <Ionicons name="notifications" size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} /> }} />
    </Tabs>
  );
}