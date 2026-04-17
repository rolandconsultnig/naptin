import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { WORKPLACE_MODULES } from '../data/modules'
import type { ModulesStackParamList } from '../navigation/types'

type Nav = NativeStackNavigationProp<ModulesStackParamList, 'ModuleList'>

export default function ModuleListScreen() {
  const navigation = useNavigation<Nav>()

  return (
    <View style={styles.root}>
      <Text style={styles.head}>Workplace</Text>
      <Text style={styles.sub}>Open a module to see its native shell.</Text>
      <FlatList
        data={WORKPLACE_MODULES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}
            onPress={() =>
              navigation.navigate('ModuleDetail', {
                moduleId: item.id,
                title: item.title,
                subtitle: item.subtitle,
              })
            }
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7faf8', paddingHorizontal: 20, paddingTop: 12 },
  head: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  sub: { marginTop: 4, color: '#64748b', fontSize: 14 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8e2',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  subtitle: { marginTop: 4, fontSize: 13, color: '#64748b' },
})
