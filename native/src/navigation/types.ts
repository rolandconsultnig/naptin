export type AuthStackParamList = {
  Login: undefined
}

export type ModulesStackParamList = {
  ModuleList: undefined
  ModuleDetail: { moduleId: string; title: string; subtitle: string }
}

export type MainTabParamList = {
  Home: undefined
  Modules: undefined
  Account: undefined
}
