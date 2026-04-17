import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSession } from '../auth/SessionContext'

export default function LoginScreen() {
  const { login, loading } = useSession()
  const [email, setEmail] = useState('staff@naptin.gov.ng')
  const [password, setPassword] = useState('naptin2026')
  const [error, setError] = useState('')

  const onSubmit = async () => {
    setError('')
    const res = await login(email.trim(), password)
    if (!res.ok) setError('Invalid credentials.')
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.hero}>
        <Text style={styles.badge}>NAPTIN</Text>
        <Text style={styles.title}>Staff portal</Text>
        <Text style={styles.sub}>Native app — same demo accounts as the web portal.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="staff@naptin.gov.ng"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }, loading && { opacity: 0.55 }]}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Sign in</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7faf8' },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 20,
    backgroundColor: '#006838',
  },
  badge: {
    alignSelf: 'flex-start',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.72)', marginTop: 8, fontSize: 14, lineHeight: 20 },
  card: {
    marginHorizontal: 20,
    marginTop: -28,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8e2',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8e2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 14,
  },
  err: { color: '#b91c1c', marginBottom: 10, fontSize: 13 },
  btn: {
    backgroundColor: '#006838',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
