import { RouteProp, useRoute } from '@react-navigation/native'
import { StyleSheet, Text, View } from 'react-native'
import type { ModulesStackParamList } from '../navigation/types'

type R = RouteProp<ModulesStackParamList, 'ModuleDetail'>

export default function ModuleDetailScreen() {
  const { params } = useRoute<R>()
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{params.title}</Text>
      <Text style={styles.sub}>{params.subtitle}</Text>
      <View style={styles.box}>
        <Text style={styles.boxText}>
          Native screen for “{params.moduleId}”. Implement lists and forms here using the same REST endpoints as
          the web app (`/api/v1/...`).
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7faf8', padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  sub: { marginTop: 8, fontSize: 15, color: '#64748b', lineHeight: 22 },
  box: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8e2',
  },
  boxText: { fontSize: 14, color: '#334155', lineHeight: 21 },
})
