import React, { useState, useCallback } from "react";
import { 
  Pressable, 
  ScrollView, 
  Text, 
  TextInput, 
  View, 
  Modal 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { syncData } from "../services/authService";
import { useAuth } from "../context/AuthContext";

type Transaction = {
  id: string;
  amount: number;
  category: "Needs" | "Wants" | "Savings";
  date: number;
  description: string;
};

const CATEGORY_META = {
  Needs: { emoji: "🏠", color: "#fb7185", label: "Needs", percent: 50 },
  Wants: { emoji: "🎮", color: "#fbbf24", label: "Wants", percent: 30 },
  Savings: { emoji: "📈", color: "#60a5fa", label: "Savings & Investing", percent: 20 },
};

export default function BudgetScreen() {
  const { userData, updateUserData } = useAuth();
  const budget = userData.monthly_budget;
  const transactions = userData.transactions;
  
  const [isSettingBudget, setIsSettingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  const [isAddingTx, setIsAddingTx] = useState(false);
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState<"Needs" | "Wants" | "Savings">("Needs");

  const handleSaveBudget = async () => {
    const val = parseInt(budgetInput, 10);
    if (!isNaN(val) && val > 0) {
      await updateUserData({ monthly_budget: val });
    }
    setIsSettingBudget(false);
  };

  const handleAddTransaction = async () => {
    const amount = parseFloat(txAmount);
    if (!txDesc || isNaN(amount) || amount <= 0) return;

    const newTx: Transaction = {
      id: Math.random().toString(),
      amount,
      category: txCategory,
      date: Date.now(),
      description: txDesc
    };

    const newTransactions = [newTx, ...transactions];
    await updateUserData({ transactions: newTransactions });
    
    setIsAddingTx(false);
    setTxDesc("");
    setTxAmount("");
  };

  const getSpentByCategory = (cat: string) => {
    return transactions
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const needsSpent = getSpentByCategory("Needs");
  const wantsSpent = getSpentByCategory("Wants");
  const savingsSpent = getSpentByCategory("Savings");

  const totalSpent = needsSpent + wantsSpent + savingsSpent;
  const balanceLeft = Math.max(0, budget - totalSpent);

  const needsBudget = budget * 0.5;
  const wantsBudget = budget * 0.3;
  const savingsBudget = budget * 0.2;

  const spentData = [
    { key: "Needs" as const, spent: needsSpent, total: needsBudget },
    { key: "Wants" as const, spent: wantsSpent, total: wantsBudget },
    { key: "Savings" as const, spent: savingsSpent, total: savingsBudget },
  ];

  const renderProgressBar = (spent: number, total: number, color: string) => {
    const safeTotal = total > 0 ? total : 1;
    const progress = Math.min((spent / safeTotal) * 100, 100);
    const isOver = spent > total && total > 0;
    return (
      <View style={{ marginTop: 8, height: 6, width: '100%', borderRadius: 3, backgroundColor: '#1e293b', overflow: 'hidden' }}>
        <View 
          style={{ 
            height: 6, 
            borderRadius: 3, 
            backgroundColor: isOver ? '#ef4444' : color, 
            width: `${progress}%` 
          }} 
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView className="px-6 pt-16 pb-24" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white">Budget</Text>
            <Text className="mt-1 text-sm text-slate-400">Track your 50/30/20 spending</Text>
          </View>
          <Pressable 
            className="rounded-full bg-slate-800 border border-slate-700 px-4 py-2"
            onPress={() => {
              setBudgetInput(budget.toString());
              setIsSettingBudget(true);
            }}
          >
            <Text className="text-xs font-semibold text-emerald-400">
              ⚙ Configure
            </Text>
          </Pressable>
        </View>

        {/* Total Balance Card */}
        <View className="mt-8 items-center rounded-3xl border border-emerald-900/40 bg-slate-900 p-8">
          <Text className="text-xs uppercase tracking-widest text-slate-400">
            Balance Remaining
          </Text>
          <Text className="mt-2 text-5xl font-bold text-emerald-400">
            ₹{balanceLeft.toLocaleString()}
          </Text>
          <View className="mt-3 flex-row items-center gap-4">
            <View className="flex-row items-center">
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34d399', marginRight: 6 }} />
              <Text className="text-xs text-slate-400">
                Budget: ₹{budget.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginRight: 6 }} />
              <Text className="text-xs text-slate-400">
                Spent: ₹{totalSpent.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* 50/30/20 Breakdown */}
        <View className="mt-8">
          <View className="flex-row items-center mb-4">
            <Text style={{ fontSize: 18 }}>📊</Text>
            <Text className="ml-2 text-lg font-bold text-white">50/30/20 Breakdown</Text>
          </View>

          {spentData.map(({ key, spent, total }) => {
            const meta = CATEGORY_META[key];
            const isOver = spent > total && total > 0;
            return (
              <View key={key} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 mb-3">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text style={{ fontSize: 18, marginRight: 8 }}>{meta.emoji}</Text>
                    <Text style={{ color: meta.color }} className="text-base font-semibold">
                      {meta.label} ({meta.percent}%)
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-semibold text-slate-200">
                      ₹{spent.toLocaleString()}
                    </Text>
                    <Text className="text-[10px] text-slate-500">
                      of ₹{total.toLocaleString()}
                    </Text>
                  </View>
                </View>
                {renderProgressBar(spent, total, meta.color)}
                {isOver && (
                  <Text className="mt-2 text-[10px] font-bold uppercase text-red-400">
                    ⚠ Over budget
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Recent Transactions */}
        <View className="mt-8 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Text style={{ fontSize: 18 }}>🧾</Text>
              <Text className="ml-2 text-lg font-bold text-white">Recent Activity</Text>
            </View>
            <Pressable 
              className="rounded-full bg-emerald-400 px-4 py-2 flex-row items-center"
              onPress={() => setIsAddingTx(true)}
            >
              <Text className="text-sm font-bold text-slate-950">+ Log Expense</Text>
            </Pressable>
          </View>

          {transactions.length === 0 ? (
            <View className="items-center py-10">
              <Text style={{ fontSize: 40 }}>💳</Text>
              <Text className="mt-4 text-base font-semibold text-white">No Expenses Yet</Text>
              <Text className="mt-1 text-sm text-slate-500 text-center">
                Tap "+ Log Expense" to start tracking where your money goes.
              </Text>
            </View>
          ) : (
            transactions.map((t: Transaction) => {
              const meta = CATEGORY_META[t.category as keyof typeof CATEGORY_META];

              return (
                <View key={t.id} className="flex-row justify-between items-center border-b border-slate-800 py-4">
                  <View className="flex-row items-center flex-1">
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: '#1e293b',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-white">
                        {t.description}
                      </Text>
                      <View className="flex-row items-center mt-1 gap-2">
                        <Text
                          style={{ color: meta.color }}
                          className="text-[10px] font-bold uppercase"
                        >
                          {t.category}
                        </Text>
                        <Text className="text-[10px] text-slate-600">•</Text>
                        <Text className="text-[10px] text-slate-500">
                          {new Date(t.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text className="text-base font-bold text-slate-200">
                    -₹{t.amount.toLocaleString()}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Set Budget Modal */}
      <Modal visible={isSettingBudget} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-slate-950/90 px-6">
          <View className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-8">
            <Text style={{ fontSize: 32, textAlign: 'center' }}>💰</Text>
            <Text className="mt-4 text-2xl font-bold text-white text-center">
              Set Monthly Budget
            </Text>
            <Text className="mt-2 text-slate-400 text-center text-sm">
              Enter your monthly take-home income to auto-allocate via the 50/30/20 rule.
            </Text>
            <TextInput
              className="mt-6 w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-xl text-white"
              keyboardType="numeric"
              placeholder="₹0"
              placeholderTextColor="#64748b"
              value={budgetInput}
              onChangeText={setBudgetInput}
            />
            <View className="mt-6 flex-row gap-4">
              <Pressable className="flex-1 py-4 border border-slate-700 rounded-full items-center" onPress={() => setIsSettingBudget(false)}>
                <Text className="text-slate-300 font-bold">Cancel</Text>
              </Pressable>
              <Pressable className="flex-1 py-4 bg-emerald-400 rounded-full items-center" onPress={handleSaveBudget}>
                <Text className="text-slate-950 font-bold">Save Budget</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Expense Modal */}
      <Modal visible={isAddingTx} transparent animationType="slide">
        <View className="flex-1 justify-end bg-slate-950/80">
          <View className="w-full rounded-t-3xl border-t border-slate-800 bg-slate-900 p-8 pb-12">
            <View className="items-center mb-6">
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#334155' }} />
            </View>
            <Text className="text-2xl font-bold text-white mb-6">Log Expense</Text>
            
            <Text className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">Amount (₹)</Text>
            <TextInput
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-xl text-white mb-5"
              keyboardType="numeric"
              placeholder="₹0.00"
              placeholderTextColor="#64748b"
              value={txAmount}
              onChangeText={setTxAmount}
            />

            <Text className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">Description</Text>
            <TextInput
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-base text-white mb-5"
              placeholder="e.g. Groceries, Netflix, SIP"
              placeholderTextColor="#64748b"
              value={txDesc}
              onChangeText={setTxDesc}
            />

            <Text className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-widest">Category</Text>
            <View className="flex-row gap-2 mb-8">
              {(["Needs", "Wants", "Savings"] as const).map(cat => {
                const isActive = txCategory === cat;
                const meta = CATEGORY_META[cat];
                return (
                  <Pressable 
                    key={cat}
                    onPress={() => setTxCategory(cat)}
                    className={`flex-1 items-center justify-center p-3 rounded-xl border ${isActive ? 'border-emerald-500' : 'border-slate-700'}`}
                    style={{ backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : '#1e293b' }}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>{meta.emoji}</Text>
                    <Text className={`text-xs font-semibold ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row gap-4">
              <Pressable className="flex-1 py-4 border border-slate-700 rounded-full items-center" onPress={() => setIsAddingTx(false)}>
                <Text className="text-slate-300 font-bold">Cancel</Text>
              </Pressable>
              <Pressable className="flex-1 py-4 bg-emerald-400 rounded-full items-center" onPress={handleAddTransaction}>
                <Text className="text-slate-950 font-bold">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
