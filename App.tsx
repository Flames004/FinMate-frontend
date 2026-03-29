import "./global.css";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";

import HomeScreen from "./src/screens/HomeScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import NewsScreen from "./src/screens/NewsScreen";
import ModuleScreen from "./src/screens/ModuleScreen";
import BudgetScreen from "./src/screens/BudgetScreen";
import CurrencyConverterScreen from "./src/screens/CurrencyConverterScreen";
import type { RootStackParamList, MainTabParamList } from "./src/types/navigation";

import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#020617" },
        headerTintColor: "#E2E8F0",
        tabBarStyle: {
          backgroundColor: "#020617",
          borderTopColor: "#1e293b",
          paddingBottom: 6,
          paddingTop: 4,
          height: 60,
        },
        tabBarActiveTintColor: "#34d399",
        tabBarInactiveTintColor: "#64748b",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          title: "Budget",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          title: "News",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const level = await AsyncStorage.getItem("@finmate_userLevel");
        if (level !== null) {
          setInitialRoute("Main");
        } else {
          setInitialRoute("Onboarding");
        }
      } catch (e) {
        setInitialRoute("Onboarding");
      }
    }
    checkOnboarding();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#020617" }}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#020617" },
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Module" component={ModuleScreen} />
          <Stack.Screen name="CurrencyConverter" component={CurrencyConverterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
