import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) { setError('Remplissez tous les champs'); return; }
    setLoading(true); setError('');
    const { error: err } = await signIn(email.trim(), password);
    if (err) { setError(err); setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.logo}>🍷</Text>
          <Text style={styles.title}>InviWine</Text>
          <Text style={styles.subtitle}>Investissez dans les grands crus</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.input}>
              <Text style={styles.inputText} onPress={() => {}}/>
            </View>
          </View>
          
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
            <Text style={styles.linkText}>Pas encore de compte ? <Text style={{ color: Colors.primaryLight }}>S'inscrire</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.link}>
            <Text style={[styles.linkText, { color: Colors.textMuted }]}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 64, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: Typography['3xl'], fontWeight: Typography.black, color: Colors.text, textAlign: 'center', letterSpacing: Typography.tight },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 48 },
  form: { gap: 16 },
  inputWrap: { gap: 6 },
  label: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
  input: { backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, minHeight: 52 },
  inputText: { color: Colors.text, fontSize: Typography.base },
  error: { color: Colors.negative, fontSize: Typography.sm, textAlign: 'center' },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  btnText: { color: Colors.text, fontSize: Typography.lg, fontWeight: Typography.bold },
  link: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: Colors.textSecondary, fontSize: Typography.sm },
});