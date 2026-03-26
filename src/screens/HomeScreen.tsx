import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-slate-950 px-6 pt-12">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-bold text-white">FinMate</Text>
          <Text className="mt-1 text-sm text-slate-400">Good evening</Text>
        </View>
        <View className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
            Beta
          </Text>
        </View>
      </View>

      <Text className="mt-4 text-base text-slate-200">
        Your AI-powered money coach for Gen Z.
      </Text>

      <View className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <Text className="text-xs uppercase tracking-widest text-emerald-300">
          Start here
        </Text>
        <Text className="mt-2 text-lg font-semibold text-white">
          Build your money roadmap
        </Text>
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
        <View className="mt-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <Text className="text-base font-semibold text-white">
            Learn the basics of budgeting
          </Text>
          <Text className="mt-2 text-sm text-slate-300">
            10-minute lesson + 2 quick questions.
          </Text>
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-xs uppercase tracking-widest text-slate-400">
              Progress
            </Text>
            <Text className="text-sm font-semibold text-emerald-300">0%</Text>
          </View>
          <View className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <View className="h-2 w-0 bg-emerald-400" />
          </View>
        </View>
      </View>

      <View className="mt-6 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <Text className="text-xs uppercase tracking-widest text-slate-400">
            Goal
          </Text>
          <Text className="mt-2 text-base font-semibold text-white">
            Save 5,000 INR
          </Text>
          <Text className="mt-1 text-xs text-slate-400">Due in 3 months</Text>
        </View>
        <View className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <Text className="text-xs uppercase tracking-widest text-slate-400">
            Budget
          </Text>
          <Text className="mt-2 text-base font-semibold text-white">
            1,200 INR
          </Text>
          <Text className="mt-1 text-xs text-slate-400">Left this week</Text>
        </View>
      </View>
    </View>
  );
}
