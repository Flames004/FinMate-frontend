import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-slate-950 px-6 pt-16">
      <Text className="text-3xl font-bold text-white">FinMate</Text>
      <Text className="mt-2 text-base text-slate-200">
        Your AI-powered money coach for Gen Z.
      </Text>

      <View className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <Text className="text-lg font-semibold text-white">Start here</Text>
        <Text className="mt-2 text-sm text-slate-300">
          Complete onboarding to get a personalized learning roadmap and smart
          money insights.
        </Text>
        <Pressable
          className="mt-4 items-center rounded-full bg-emerald-400 px-4 py-3"
          onPress={() => navigation.navigate("Onboarding")}
        >
          <Text className="text-sm font-semibold text-slate-950">
            Start onboarding
          </Text>
        </Pressable>
      </View>

      <View className="mt-6">
        <Text className="text-sm uppercase tracking-widest text-slate-400">
          Today
        </Text>
        <Text className="mt-2 text-base text-slate-200">
          Learn basics of budgeting, then log your first expense.
        </Text>
      </View>
    </View>
  );
}
