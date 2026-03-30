import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { getMe, updateProfile } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signOut } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      if (response && response.success) {
        setUser(response.data);
        setName(response.data.name || "");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setUpdating(true);
    try {
      await updateProfile(name);
      Alert.alert("Success", "Profile updated successfully");
      fetchUserData();
    } catch (error: any) {
      Alert.alert("Error", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
             await signOut();
          }
        }
      ]
    );
  };

  const calculateOverallProgress = () => {
    if (!user || !user.progressMap) return 0;
    const values: number[] = Object.values(user.progressMap);
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const progress = calculateOverallProgress();

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1 px-6">
        <View className="items-center mt-8 mb-8">
          <View className="w-24 h-24 bg-emerald-500/20 rounded-full items-center justify-center border-4 border-emerald-500/30">
            <Text className="text-white text-3xl font-bold">
              {name ? name.charAt(0).toUpperCase() : user?.phone?.charAt(0)}
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold mt-4">{name || "FinMate User"}</Text>
          <Text className="text-slate-400 text-lg">+91 {user?.phone}</Text>
        </View>

        <View className="bg-slate-900 rounded-3xl p-6 mb-6 border border-slate-800">
          <Text className="text-white text-lg font-bold mb-4">Edit Profile</Text>
          <Text className="text-slate-400 text-sm mb-2">Display Name</Text>
          <View className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mb-4">
            <TextInput
              className="text-white text-lg"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#475569"
            />
          </View>
          <TouchableOpacity 
            className={`py-3 rounded-xl items-center ${updating ? 'bg-slate-800' : 'bg-emerald-500'}`}
            onPress={handleUpdateProfile}
            disabled={updating}
          >
            {updating ? <ActivityIndicator color="#fff" /> : <Text className="text-slate-950 font-bold">Save Changes</Text>}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mb-6">
          <View className="bg-slate-900 flex-1 rounded-3xl p-5 mr-3 border border-slate-800 items-center">
            <View className="w-12 h-12 bg-blue-500/20 rounded-full items-center justify-center mb-2">
              <Ionicons name="trophy" size={24} color="#3b82f6" />
            </View>
            <Text className="text-slate-400 text-sm">Level</Text>
            <Text className="text-white text-lg font-bold">{user?.level || "Rookie"}</Text>
          </View>
          <View className="bg-slate-900 flex-1 rounded-3xl p-5 ml-3 border border-slate-800 items-center">
            <View className="w-12 h-12 bg-purple-500/20 rounded-full items-center justify-center mb-2">
              <Ionicons name="stats-chart" size={24} color="#a855f7" />
            </View>
            <Text className="text-slate-400 text-sm">Progress</Text>
            <Text className="text-white text-lg font-bold">{progress}%</Text>
          </View>
        </View>

        <View className="bg-slate-900 rounded-3xl p-6 mb-8 border border-slate-800">
          <Text className="text-white text-lg font-bold mb-4">Account Stats</Text>
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-400">Total Transactions</Text>
            <Text className="text-white font-bold">{user?.transactions?.length || 0}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-400">Monthly Budget</Text>
            <Text className="text-emerald-500 font-bold">₹{user?.monthly_budget || 0}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-slate-400">Status</Text>
            <Text className="text-emerald-500 font-bold">Verified</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-red-500/10 border border-red-500/30 py-4 rounded-2xl items-center flex-row justify-center mb-10"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" className="mr-2" />
          <Text className="text-red-500 font-bold text-lg"> Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
