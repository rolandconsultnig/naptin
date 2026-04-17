import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSession } from '../auth/SessionContext'

export default function ProfileScreen() {
  const { session, logout } = useSession()
  const u = session?.user

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.initialsWrap}>
          <Text style={styles.initialsText}>{u?.initials}</Text>
        </View>
        <Text style={styles.name}>{u?.name}</Text>
        <Text style={styles.email}>{u?.email}</Text>
        <Text style={styles.line}>Staff ID · {u?.staffId}</Text>
        <Text style={styles.line}>Role · {u?.role}</Text>
        <Text style={styles.line}>Tenant · {u?.tenantId}</Text>
      </View>
      <Pressable style={({ pressed }) => [styles.out, pressed && { opacity: 0.9 }]} onPress={() => logout()}>
        <Text style={styles.outText}>Sign out</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7faf8', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8e2',
    alignItems: 'center',
  },
  initialsWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#006838',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  name: { marginTop: 14, fontSize: 20, fontWeight: '800', color: '#0f172a' },
  email: { marginTop: 4, color: '#64748b', fontSize: 14 },
  line: { marginTop: 10, fontSize: 13, color: '#475569', alignSelf: 'stretch', textAlign: 'center' },
  out: {
    marginTop: 28,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  outText: { color: '#b91c1c', fontWeight: '700', fontSize: 15 },
})
