import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "CurrencyConverter">;

const CURRENCIES: { code: string; name: string; flag: string; rate: number }[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", rate: 83.40 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", rate: 90.10 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", rate: 105.20 },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", rate: 54.30 },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", rate: 61.20 },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", rate: 0.56 },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", rate: 62.80 },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", rate: 22.71 },
];

export default function CurrencyConverterScreen({ navigation }: Props) {
  const [foreignAmount, setForeignAmount] = useState<string>("100");
  const [selectedCode, setSelectedCode] = useState<string>("USD");

  const selected = CURRENCIES.find(c => c.code === selectedCode)!;
  const amountNumber = parseFloat(foreignAmount) || 0;
  const convertedAmount = amountNumber * selected.rate;

  return (
    <ScrollView className="flex-1 bg-slate-950 px-6 pt-16 pb-20">
      {/* Back */}
      <Pressable onPress={() => navigation.goBack()} className="mb-6">
        <Text className="text-emerald-400 font-semibold">← Back</Text>
      </Pressable>

      {/* Header */}
      <Text style={{ fontSize: 32 }}>💱</Text>
      <Text className="mt-2 text-3xl font-bold text-white">Currency Converter</Text>
      <Text className="mt-1 text-sm text-slate-400">
        Convert global currencies to Indian Rupees (₹).
      </Text>

      {/* ──── Converter Card ──── */}
      <View className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        
        {/* From */}
        <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">You Convert</Text>
        <View className="flex-row items-center rounded-2xl border border-slate-700 bg-slate-950 p-4 mb-4">
          <TextInput
            className="flex-1 text-2xl font-bold text-white"
            keyboardType="numeric"
            value={foreignAmount}
            onChangeText={setForeignAmount}
            placeholder="0"
            placeholderTextColor="#64748b"
          />
          <View className="ml-3 flex-row items-center rounded-xl bg-slate-800 px-3 py-2">
            <Text style={{ fontSize: 18, marginRight: 6 }}>{selected.flag}</Text>
            <Text className="text-base font-bold text-slate-200">{selected.code}</Text>
          </View>
        </View>

        {/* Swap arrow */}
        <View className="items-center -my-2 z-10">
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: '#334155',
              backgroundColor: '#1e293b',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text className="text-emerald-400 font-bold text-lg">↓</Text>
          </View>
        </View>

        {/* To */}
        <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 mt-2">You Get</Text>
        <View className="flex-row items-center rounded-2xl border border-emerald-900/50 bg-slate-950 p-4">
          <Text className="flex-1 text-3xl font-bold text-emerald-400">
            ₹{convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View className="ml-3 flex-row items-center rounded-xl bg-emerald-900/30 border border-emerald-800 px-3 py-2">
            <Text style={{ fontSize: 18, marginRight: 6 }}>🇮🇳</Text>
            <Text className="text-base font-bold text-emerald-400">INR</Text>
          </View>
        </View>
      </View>

      {/* ──── Currency Picker ──── */}
      <View className="mt-8">
        <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Select Base Currency
        </Text>
        <View className="gap-2">
          {CURRENCIES.map((cur) => {
            const isActive = selectedCode === cur.code;
            return (
              <Pressable
                key={cur.code}
                onPress={() => setSelectedCode(cur.code)}
                className={`flex-row items-center justify-between rounded-xl border p-4 ${
                  isActive
                    ? "border-emerald-500 bg-emerald-900/15"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                <View className="flex-row items-center">
                  <Text style={{ fontSize: 22, marginRight: 12 }}>{cur.flag}</Text>
                  <View>
                    <Text className={`text-sm font-semibold ${isActive ? "text-emerald-400" : "text-white"}`}>
                      {cur.code}
                    </Text>
                    <Text className="text-[11px] text-slate-500">{cur.name}</Text>
                  </View>
                </View>
                <Text className={`text-sm font-semibold ${isActive ? "text-emerald-400" : "text-slate-400"}`}>
                  ₹{cur.rate.toFixed(2)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Rate info */}
      <View className="mt-8 mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <View className="flex-row items-center mb-2">
          <Text style={{ fontSize: 16, marginRight: 6 }}>ℹ️</Text>
          <Text className="text-sm font-semibold text-slate-300">Exchange Rate</Text>
        </View>
        <Text className="text-xs text-slate-400 leading-relaxed">
          1 {selected.code} ({selected.name}) = ₹{selected.rate.toFixed(2)}. Rates are indicative and updated for educational purposes.
        </Text>
      </View>
    </ScrollView>
  );
}
