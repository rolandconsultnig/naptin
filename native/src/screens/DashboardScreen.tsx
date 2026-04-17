import { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { fetchApiHealth } from '../api/client'
import { useSession } from '../auth/SessionContext'
import { API_BASE_URL } from '../config'

export default function DashboardScreen() {
  const { session } = useSession()
  const [health, setHealth] = useState<string>('')
  const [busy, setBusy] = useState(false)

  const ping = useCallback(async () => {
    setBusy(true)
    setHealth('')
    try {
      const h = await fetchApiHealth(session?.token ?? null)
      setHealth(h.ok ? `API OK (${h.db ?? 'unknown'})` : 'API returned not ok')
    } catch (e) {
      setHealth(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setBusy(false)
    }
  }, [session?.token])

  const u = session?.user

  return (
    <View style={styles.wrap}>
      <Text style={styles.hi}>Hello, {u?.name?.split(' ')[0] ?? 'colleague'}</Text>
      <Text style={styles.meta}>
        {u?.role} · {u?.department}
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backend</Text>
        <Text style={styles.mono} numberOfLines={2}>
          {API_BASE_URL}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }, busy && { opacity: 0.6 }]}
          onPress={ping}
          disabled={busy}
        >
          <Text style={styles.btnText}>{busy ? 'Checking…' : 'Check API health'}</Text>
        </Pressable>
        {health ? <Text style={styles.health}>{health}</Text> : null}
      </View>
      <Text style={styles.foot}>
        Native shell is live; module screens will call the same Node API as the web portal as each area is ported.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: '#f7faf8' },
  hi: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  meta: { marginTop: 6, color: '#64748b', fontSize: 14 },
  card: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8e2',
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#006838', marginBottom: 8 },
  mono: { fontSize: 12, color: '#475569', marginBottom: 12 },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: '#006838',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  health: { marginTop: 12, fontSize: 14, color: '#0f172a' },
  foot: { marginTop: 28, fontSize: 13, color: '#64748b', lineHeight: 19 },
})
