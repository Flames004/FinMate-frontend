import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  userToken: string | null;
  userLevel: string | null;
  isLoading: boolean;
  signIn: (token: string, level?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (level: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored credentials on app mount
    const loadAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem("@finmate_token");
        const level = await AsyncStorage.getItem("@finmate_userLevel");
        
        setUserToken(token);
        setUserLevel(level);
      } catch (e) {
        console.error("Failed to load auth data", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const signIn = async (token: string, level: string | null = null) => {
    await AsyncStorage.setItem("@finmate_token", token);
    if (level) {
      await AsyncStorage.setItem("@finmate_userLevel", level);
    }
    
    setUserToken(token);
    setUserLevel(level);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("@finmate_token");
    await AsyncStorage.removeItem("@finmate_userLevel");
    
    setUserToken(null);
    setUserLevel(null);
  };

  const completeOnboarding = async (level: string) => {
    await AsyncStorage.setItem("@finmate_userLevel", level);
    setUserLevel(level);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        userToken, 
        userLevel, 
        isLoading, 
        signIn, 
        signOut, 
        completeOnboarding 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
