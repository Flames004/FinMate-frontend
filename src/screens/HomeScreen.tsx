import React, { useEffect, useState, useCallback } from "react";
import { Pressable, Text, View, ScrollView, useWindowDimensions } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabParamList } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MODULES_DATA from "../data/modules.json";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import Svg, { Path } from "react-native-svg";

type Props = NativeStackScreenProps<MainTabParamList, "Home">;

export default function HomeScreen({ }: Props) {
  const [level, setLevel] = useState("Rookie");
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [budgetBalance, setBudgetBalance] = useState<number>(0);
  const [isBudgetConfigured, setIsBudgetConfigured] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    async function getUserLevel() {
      const storedLevel = await AsyncStorage.getItem("@finmate_userLevel");
      if (storedLevel && (storedLevel === "Rookie" || storedLevel === "Explorer" || storedLevel === "Master")) {
        setLevel(storedLevel);
      }
    }
    getUserLevel();
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function loadProgress() {
        // level might be updated from state, MODULES_DATA needs to match.
        // We ensure we read safely.
        const currentModules = (MODULES_DATA as any)[level] || [];
        const newProgressMap: Record<string, number> = {};
        for (const mod of currentModules) {
          try {
            const val = await AsyncStorage.getItem(`@finmate_progress_${mod.id}`);
            if (val) {
              newProgressMap[mod.id] = parseInt(val, 10);
            }
          } catch (e) {
            // ignore
          }
        }
        setProgressMap(newProgressMap);

        try {
          const bVal = await AsyncStorage.getItem("@finmate_monthly_budget");
          const tVal = await AsyncStorage.getItem("@finmate_transactions");
          
          if (bVal) {
            setIsBudgetConfigured(true);
            const budget = parseInt(bVal, 10);
            let totalSpent = 0;
            if (tVal) {
              const txs = JSON.parse(tVal);
              totalSpent = txs.reduce((sum: number, t: any) => sum + t.amount, 0);
            }
            setBudgetBalance(Math.max(0, budget - totalSpent));
          } else {
            setIsBudgetConfigured(false);
            setBudgetBalance(0);
          }
        } catch (e) {}
      }
      loadProgress();
    }, [level])
  );

  const modules = MODULES_DATA[level as keyof typeof MODULES_DATA];
  const totalModules = modules.length;
  const completedModules = modules.filter(m => progressMap[m.id] === 100).length;
  const overallProgress = totalModules === 0 ? 0 : (completedModules / totalModules) * 100;

  // Curved road calculations
  const roadContainerWidth = screenWidth - 48;
  const nodeSpacing = 140;
  const leftCenter = 36;
  const rightCenter = roadContainerWidth - 36;
  const roadHeight = (modules.length - 1) * nodeSpacing + 80;

  const nodePoints = modules.map((_, i) => ({
    x: i % 2 === 0 ? leftCenter : rightCenter,
    y: i * nodeSpacing + 30,
  }));

  let roadPathD = '';
  if (nodePoints.length > 0) {
    roadPathD = `M ${nodePoints[0].x} ${nodePoints[0].y}`;
    for (let i = 1; i < nodePoints.length; i++) {
      const prev = nodePoints[i - 1];
      const curr = nodePoints[i];
      const midY = (prev.y + curr.y) / 2;
      roadPathD += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
  }

  return (
    <ScrollView className="flex-1 bg-slate-950 px-6 pt-12 pb-20">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-bold text-white">FinMate</Text>
          <Text className="mt-1 text-sm text-slate-400">Your financial learning companion</Text>
        </View>
        <View className="rounded-full border border-emerald-800 bg-emerald-900/40 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
            {level}
          </Text>
        </View>
      </View>

      <Text className="mt-4 text-base text-slate-300">
        Level up your money skills, one module at a time.
      </Text>

      <View className="mt-6 overflow-hidden rounded-3xl border border-emerald-900/40 bg-slate-900 p-1">
        <View className="relative h-16 justify-center rounded-2xl bg-slate-950 px-5 border border-slate-800/60 overflow-hidden">
          <View 
            className="absolute left-0 top-0 bottom-0 bg-emerald-900/40"
            style={{ width: `${overallProgress}%` }}
          />
          <View className="flex-row items-center justify-between relative z-10">
            <View>
              <Text className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Level Progress
              </Text>
              <Text className="text-white text-sm font-medium mt-0.5">
                {completedModules} of {totalModules} Modules
              </Text>
            </View>
            <View className="items-center justify-center bg-emerald-950 px-3 py-1.5 rounded-full border border-emerald-800">
              <Text className="text-base font-bold text-emerald-300">
                {Math.round(overallProgress)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <Text className="text-xs uppercase tracking-widest text-emerald-300">
          Daily Action
        </Text>
        <Text className="mt-2 text-lg font-semibold text-white">
          Review today's finance news
        </Text>
        <Text className="mt-2 text-sm text-slate-300">
          Stay updated with the latest trends in the market to make smart choices.
        </Text>
        <Pressable
          className="mt-4 items-center rounded-full bg-emerald-400 px-4 py-3"
          onPress={() => navigation.navigate("News")}
        >
          <Text className="text-sm font-semibold text-slate-950">
            Read News
          </Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 32 }}>
        <Text className="text-sm uppercase tracking-widest text-slate-400 mb-4">
          Learning Path
        </Text>

        <View style={{ height: roadHeight, position: 'relative' }}>
          {/* SVG Winding Road */}
          <Svg
            width={roadContainerWidth}
            height={roadHeight}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* Road base */}
            <Path
              d={roadPathD}
              stroke="#1e293b"
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
            />
            {/* Road center dashed line */}
            <Path
              d={roadPathD}
              stroke="#34d399"
              strokeWidth={2}
              fill="none"
              opacity={0.45}
              strokeDasharray="8,6"
              strokeLinecap="round"
            />
          </Svg>

          {/* Module Nodes */}
          {modules.map((mod, index) => {
            const point = nodePoints[index];
            const modProgress = progressMap[mod.id] || 0;
            const isLeft = index % 2 === 0;

            return (
              <Pressable
                key={mod.id}
                onPress={() =>
                  (navigation as any).navigate("Module", {
                    moduleId: mod.id,
                  })
                }
                style={{
                  position: 'absolute',
                  top: point.y - 24,
                  left: 0,
                  right: 0,
                  flexDirection: isLeft ? 'row' : 'row-reverse',
                  alignItems: 'flex-start',
                }}
              >
                {/* Node Circle */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor:
                      modProgress === 100 ? '#10b981' : '#0f172a',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor:
                      modProgress === 100 ? '#34d399' : '#334155',
                    marginLeft: isLeft ? leftCenter - 24 : 0,
                    marginRight: !isLeft
                      ? roadContainerWidth - rightCenter - 24
                      : 0,
                    zIndex: 10,
                  }}
                >
                  {modProgress === 100 ? (
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#020617',
                      }}
                    >
                      ✓
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#34d399',
                      }}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>

                {/* Info Card */}
                <View
                  style={{
                    flex: 1,
                    marginLeft: isLeft ? 12 : 8,
                    marginRight: !isLeft ? 12 : 8,
                    backgroundColor: '#0f172a',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#1e293b',
                    padding: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#fff',
                    }}
                  >
                    {mod.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: '#94a3b8',
                      marginTop: 2,
                    }}
                  >
                    {mod.duration} • {modProgress}% completed
                  </Text>
                  <View
                    style={{
                      height: 4,
                      backgroundColor: '#1e293b',
                      borderRadius: 2,
                      marginTop: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: 4,
                        backgroundColor: '#34d399',
                        borderRadius: 2,
                        width: `${modProgress}%`,
                      }}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-2 mb-10 flex-row gap-3">
        <Pressable 
          className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-4"
          onPress={() => (navigation as any).navigate("CurrencyConverter")}
        >
          <Text className="text-xs uppercase tracking-widest text-slate-400">
            Tools
          </Text>
          <Text className="mt-2 text-base font-semibold text-white">
            Converter
          </Text>
          <Text className="mt-1 text-xs text-slate-400">Live FX Rates</Text>
        </Pressable>
        <Pressable 
          className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-4"
          onPress={() => navigation.navigate("Budget")}
        >
          <Text className="text-xs uppercase tracking-widest text-slate-400">
            Budget
          </Text>
          <Text className="mt-2 text-base font-semibold text-white">
            {isBudgetConfigured ? `₹${budgetBalance.toLocaleString()}` : "Not Set"}
          </Text>
          <Text className="mt-1 text-xs text-slate-400">
            {isBudgetConfigured ? "Left this month" : "Tap to configure"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
