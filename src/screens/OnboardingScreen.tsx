import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-slate-950 px-6 pt-16">
      <Text className="text-2xl font-bold text-white">Onboarding</Text>
      <Text className="mt-2 text-sm text-slate-300">
        We will ask a few questions to personalize your roadmap.
      </Text>

      <View className="mt-8 gap-3">
        <View className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <Text className="text-sm font-semibold text-white">
            1. What is your current money goal?
          </Text>
          <Text className="mt-1 text-xs text-slate-400">
            Example: save 5,000 INR in 3 months.
          </Text>
        </View>
        <View className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <Text className="text-sm font-semibold text-white">
            2. How confident are you with budgeting?
          </Text>
          <Text className="mt-1 text-xs text-slate-400">
            Choose from beginner, intermediate, advanced.
          </Text>
        </View>
        <View className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <Text className="text-sm font-semibold text-white">
            3. How often do you track expenses?
          </Text>
          <Text className="mt-1 text-xs text-slate-400">
            Daily, weekly, occasionally, never.
          </Text>
        </View>
      </View>

      <Pressable
        className="mt-8 items-center rounded-full border border-slate-700 px-4 py-3"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-sm font-semibold text-slate-200">
          Back to home
        </Text>
      </Pressable>
    </View>
  );
}
