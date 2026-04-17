import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DashboardScreen from '../screens/DashboardScreen'
import ModuleDetailScreen from '../screens/ModuleDetailScreen'
import ModuleListScreen from '../screens/ModuleListScreen'
import ProfileScreen from '../screens/ProfileScreen'
import type { MainTabParamList, ModulesStackParamList } from './types'

const ModStack = createNativeStackNavigator<ModulesStackParamList>()

function ModulesNavigator() {
  return (
    <ModStack.Navigator
      screenOptions={{
        headerTintColor: '#006838',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#f7faf8' },
      }}
    >
      <ModStack.Screen name="ModuleList" component={ModuleListScreen} options={{ title: 'Workplace' }} />
      <ModStack.Screen
        name="ModuleDetail"
        component={ModuleDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </ModStack.Navigator>
  )
}

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerTintColor: '#006838',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#006838',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: 'Home', headerTitle: 'NAPTIN' }} />
      <Tab.Screen
        name="Modules"
        component={ModulesNavigator}
        options={{ headerShown: false, title: 'Workplace' }}
      />
      <Tab.Screen name="Account" component={ProfileScreen} options={{ title: 'Account' }} />
    </Tab.Navigator>
  )
}
