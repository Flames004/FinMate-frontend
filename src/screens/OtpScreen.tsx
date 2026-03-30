import React, { useState, useEffect } from "react";
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
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { verifyOtp, sendOtp, getMe } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type OtpScreenRouteProp = RouteProp<RootStackParamList, "Otp">;
type OtpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Otp">;

export default function OtpScreen() {
  const route = useRoute<OtpScreenRouteProp>();
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const { phone } = route.params;
  const { signIn } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(phone, otp);
      if (response.success) {
        // useAuth.signIn now handles fetching cloud profile and populating state/storage
        await signIn(response.token, response.data.level);
      }
    } catch (error: any) {
      Alert.alert("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const resendOtpCode = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    try {
      await sendOtp(phone);
      setTimer(60);
      Alert.alert("Success", "New OTP sent!");
    } catch (error: any) {
      Alert.alert("Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 px-6">
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center mt-4"
      >
        <Ionicons name="arrow-back" size={24} color="#e5e7eb" />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-emerald-500/20 rounded-3xl items-center justify-center mb-4 border border-emerald-500/30">
            <Ionicons name="mail-unread" size={40} color="#10b981" />
          </View>
          <Text className="text-3xl font-bold text-white text-center">Verify Identity</Text>
          <Text className="text-slate-400 text-center mt-2 text-lg">
            Enter the 6-digit code sent to{"\n"}
            <Text className="text-emerald-500 font-semibold">+91 {phone}</Text>
          </Text>
        </View>

        <View className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <View className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mb-6 focus:border-emerald-500 items-center">
            <TextInput
              className="text-white text-3xl font-bold tracking-[15px] w-full text-center"
              placeholder="000000"
              placeholderTextColor="#475569"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />
          </View>

          <TouchableOpacity 
            className={`py-4 rounded-xl items-center justify-center shadow-lg ${loading ? 'bg-slate-800' : 'bg-emerald-500'}`}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-slate-950 font-bold text-lg">Verify OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-8">
          <Text className="text-slate-400 text-center">
            Didn't receive code?{" "}
            {timer > 0 ? (
                <Text className="text-emerald-500 font-bold">Resend in {timer}s</Text>
            ) : (
                <Text 
                    className="text-emerald-500 font-bold underline"
                    onPress={resendOtpCode}
                >
                    Resend Code
                </Text>
            )}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
