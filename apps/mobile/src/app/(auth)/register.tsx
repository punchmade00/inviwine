import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { signUp } = useAuthStore();

  const handleRegister = async () => {
    setLoading(true);
    await signUp('demo@inviwine.com', 'password123');
    setDone(true);
    setLoading(false);
  };

  if (done) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', gap: 16 }]}>
      <Text style={{ fontSize: 48 }}>✉️</Text>
      <Text style={styles.title}>Vérifiez votre email</Text>
      <Text style={styles.subtitle}>Un lien de confirmation vous a été envoyé.</Text>
      <TouchableOpacity onPress={() => router.back()}><Text style={{ color: Colors.primaryLight }}>Retour à la connexion</Text></TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.springify()}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
            <Text style={{ color: Colors.primaryLight, fontSize: Typography.base }}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez la communauté InviWine</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ gap: 16, marginTop: 32 }}>
          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Création...' : "S'inscrire"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 64 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.text },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary, marginTop: 8 },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 18, alignItems: 'center' },
  btnText: { color: Colors.text, fontSize: Typography.lg, fontWeight: Typography.bold },
});