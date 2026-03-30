import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Budget: undefined;
  News: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Otp: { phone: string };
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Module: { moduleId: string };
  CurrencyConverter: undefined;
};
