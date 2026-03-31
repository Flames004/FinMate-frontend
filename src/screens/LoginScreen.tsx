import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { sendOtp } from "../services/authService";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleSendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await sendOtp(email);
      navigation.navigate("Otp", { email });
    } catch (error: any) {
      Alert.alert("Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 px-6">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-emerald-500/20 rounded-3xl items-center justify-center mb-4 border border-emerald-500/30">
            <Ionicons name="shield-checkmark" size={40} color="#10b981" />
          </View>
          <Text className="text-3xl font-bold text-white text-center">Welcome to FinMate</Text>
          <Text className="text-slate-400 text-center mt-2 text-lg">
            Smart Finance, Simple Management
          </Text>
        </View>

        <View className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <Text className="text-white text-lg font-semibold mb-2">Email Address</Text>
          <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mb-6 focus:border-emerald-500">
            <Ionicons name="mail" size={20} color="#475569" className="mr-3" />
            <TextInput
              className="flex-1 text-white text-lg font-medium ml-2"
              placeholder="your@email.com"
              placeholderTextColor="#475569"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              maxLength={60}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity 
            className={`py-4 rounded-xl items-center justify-center shadow-lg ${loading ? 'bg-slate-800' : 'bg-emerald-500'}`}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-slate-950 font-bold text-lg">Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-slate-500 text-center mt-8 text-sm">
          By continuing, you agree to our Terms and Conditions
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
