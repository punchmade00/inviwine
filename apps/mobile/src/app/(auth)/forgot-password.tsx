import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
        <Text style={{ color: Colors.primaryLight }}>← Retour</Text>
      </TouchableOpacity>
      {sent ? (
        <View style={{ alignItems: 'center', gap: 16 }}>
          <Text style={{ fontSize: 48 }}>✉️</Text>
          <Text style={styles.title}>Email envoyé !</Text>
          <Text style={styles.subtitle}>Vérifiez votre boîte mail.</Text>
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          <Text style={styles.title}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>Entrez votre email pour recevoir un lien de réinitialisation.</Text>
          <TouchableOpacity style={styles.btn} onPress={async () => { setLoading(true); await resetPassword('user@example.com'); setSent(true); setLoading(false); }} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Envoi...' : 'Envoyer le lien'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0, padding: 24, paddingTop: 80 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.text },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 18, alignItems: 'center' },
  btnText: { color: Colors.text, fontSize: Typography.lg, fontWeight: Typography.bold },
});