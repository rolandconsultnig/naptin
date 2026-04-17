import { NavigationContainer, DefaultTheme, type Theme } from '@react-navigation/native'
import { ActivityIndicator, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SessionProvider, useSession } from './src/auth/SessionContext'
import { AuthNavigator } from './src/navigation/AuthNavigator'
import { MainNavigator } from './src/navigation/MainNavigator'

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#006838',
    background: '#f7faf8',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8e2',
    notification: '#006838',
  },
}

function Gate() {
  const { bootstrapped, session } = useSession()
  if (!bootstrapped) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7faf8' }}>
        <ActivityIndicator size="large" color="#006838" />
      </View>
    )
  }
  return session ? <MainNavigator /> : <AuthNavigator />
}

export default function App() {
  return (
    <SessionProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <Gate />
      </NavigationContainer>
    </SessionProvider>
  )
}
