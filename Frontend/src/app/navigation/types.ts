export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Register: undefined;
  PassportUpload: undefined;
  SelfieCapture: undefined;
  Confirm: undefined;
};

export type AppStackParamList = {
  Wallet: undefined;
  Audit: undefined;
};

export type AppTabName = keyof AppStackParamList;
