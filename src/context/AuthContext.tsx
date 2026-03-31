import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMe, syncData as syncCloud, updateProfile } from "../services/authService";

export interface UserData {
  email?: string;
  name?: string;
  level: string | null;
  progressMap: Record<string, number>;
  monthly_budget: number;
  transactions: any[];
}

interface AuthContextType {
  userToken: string | null;
  userData: UserData;
  isLoading: boolean;
  signIn: (token: string, level?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (level: string) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  refreshUser: (tokenOverride?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_USER_DATA: UserData = {
  level: null,
  progressMap: {},
  monthly_budget: 0,
  transactions: [],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const token = await AsyncStorage.getItem("@finmate_token");
      const level = await AsyncStorage.getItem("@finmate_userLevel");
      const progress = await AsyncStorage.getItem("@finmate_progressMap");
      const budget = await AsyncStorage.getItem("@finmate_monthly_budget");
      const transactions = await AsyncStorage.getItem("@finmate_transactions");
      const name = await AsyncStorage.getItem("@finmate_userName");
      
      if (!token || token === "null" || token === "") {
        setUserToken(null);
        setIsLoading(false);
        return;
      }
      
      setUserToken(token);
      
      const newUserData: UserData = {
        level: level,
        name: name || "",
        progressMap: progress ? JSON.parse(progress) : {},
        monthly_budget: budget ? parseInt(budget, 10) : 0,
        transactions: transactions ? JSON.parse(transactions) : [],
      };
      
      setUserData(newUserData);
      
      // If we have a token, await refresh from cloud to avoid flashing empty state
      if (token && token !== "null" && token !== "") {
        const isValid = await refreshUser(token);
        if (!isValid) {
          // Token is invalid/expired - force logout
          setUserToken(null);
        }
      }
    } catch (e) {
      console.error("Failed to load auth data", e);
      setUserToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (tokenOverride?: string): Promise<boolean> => {
    try {
      const token = tokenOverride || userToken;
      if (!token || token === "null" || token === "") return false;

      const response = await getMe();
      if (response && response.success) {
        const cloudData = response.data;
        const syncedData: UserData = {
          level: cloudData.level !== undefined ? cloudData.level : userData.level,
          name: cloudData.name !== undefined ? cloudData.name : userData.name,
          progressMap: cloudData.progressMap !== undefined ? cloudData.progressMap : userData.progressMap,
          monthly_budget: cloudData.monthly_budget !== undefined ? cloudData.monthly_budget : userData.monthly_budget,
          transactions: cloudData.transactions !== undefined ? cloudData.transactions : userData.transactions,
          email: cloudData.email
        };
        
        // Update local state
        setUserData(syncedData);
        
        // Update AsyncStorage
        await saveToLocal(syncedData);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to refresh user", e);
      return false;
    }
  };

  const saveToLocal = async (data: UserData) => {
    if (data.level) await AsyncStorage.setItem("@finmate_userLevel", data.level);
    if (data.name) await AsyncStorage.setItem("@finmate_userName", data.name);
    await AsyncStorage.setItem("@finmate_progressMap", JSON.stringify(data.progressMap));
    await AsyncStorage.setItem("@finmate_monthly_budget", data.monthly_budget.toString());
    await AsyncStorage.setItem("@finmate_transactions", JSON.stringify(data.transactions));
  };

  const updateUserData = async (partial: Partial<UserData>) => {
    const updated = { ...userData, ...partial };
    setUserData(updated);
    await saveToLocal(updated);
    
    // Push sync to cloud
    try {
      if (partial.name !== undefined) {
        await updateProfile(partial.name);
      }
      
      const hasOtherKeys = Object.keys(partial).some(k => k !== 'name');
      if (hasOtherKeys) {
        await syncCloud(partial);
      }
    } catch (e) {
      console.error("Sync to cloud failed", e);
    }
  };

  const signIn = async (token: string, level: string | null = null) => {
    setIsLoading(true);
    await AsyncStorage.setItem("@finmate_token", token);
    await refreshUser(token); // Fetch full cloud profile immediately before navigating
    setUserToken(token);
    setIsLoading(false);
  };

  const signOut = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const finmateKeys = keys.filter(k => k.startsWith("@finmate_"));
      for (const key of finmateKeys) {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.error("Signout error", e);
    }
    setUserData(INITIAL_USER_DATA);
    setUserToken(null);
  };

  const completeOnboarding = async (level: string) => {
    await updateUserData({ level });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        userToken, 
        userData, 
        isLoading, 
        signIn, 
        signOut, 
        completeOnboarding,
        updateUserData,
        refreshUser
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
