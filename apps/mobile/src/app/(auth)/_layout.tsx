import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function AuthLayout() {
  const { session, loading } = useAuthStore();
  useEffect(() => {
    if (!loading && session) router.replace('/(tabs)');
  }, [session, loading]);
  return <Stack screenOptions={{ headerShown: false }} />;
}