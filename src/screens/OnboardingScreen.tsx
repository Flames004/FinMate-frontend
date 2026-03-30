import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const QUESTIONS = [
  {
    question: "How would you describe your current money habits?",
    emoji: "💰",
    options: [
      { text: "I spend more than I make", points: 0 },
      { text: "I spend almost everything I make", points: 1 },
      { text: "I try to save a little each month", points: 2 },
      { text: "I actively budget and save", points: 3 },
      { text: "I budget, save, and invest regularly", points: 4 },
    ],
  },
  {
    question: "Do you use a budget?",
    emoji: "📊",
    options: [
      { text: "What's a budget?", points: 0 },
      { text: "I check my bank app sometimes", points: 1 },
      { text: "I track my expenses occasionally", points: 2 },
      { text: "Yes, I track my money carefully", points: 3 },
    ],
  },
  {
    question: "What is your primary financial goal?",
    emoji: "🎯",
    options: [
      { text: "Stop living paycheck to paycheck", points: 0 },
      { text: "Build an emergency fund", points: 1 },
      { text: "Save for a big purchase", points: 2 },
      { text: "Grow my wealth long-term", points: 3 },
      { text: "Achieve financial independence (FIRE)", points: 4 },
    ],
  },
  {
    question: "How do you handle unexpected expenses?",
    emoji: "🚨",
    options: [
      { text: "I'd have to borrow money or use a credit card", points: 0 },
      { text: "I'd struggle but find a way", points: 1 },
      { text: "I have a small rainy day fund", points: 2 },
      { text: "I have a fully funded emergency fund", points: 3 },
    ],
  },
  {
    question: "How would you react if your investment dropped 20%?",
    emoji: "📉",
    options: [
      { text: "Panic and sell everything immediately", points: 0 },
      { text: "Worry and consider selling", points: 1 },
      { text: "Wait it out, though I'd be anxious", points: 2 },
      { text: "Do nothing, it's a long-term investment", points: 3 },
      { text: "See it as an opportunity and buy more", points: 4 },
    ],
  },
  {
    question: "Have you ever invested in the stock market?",
    emoji: "📈",
    options: [
      { text: "No, never", points: 0 },
      { text: "No, but I want to start", points: 1 },
      { text: "Yes, I have a workplace retirement account", points: 2 },
      { text: "Yes, I buy individual stocks or funds", points: 3 },
    ],
  },
  {
    question: "How familiar are you with compound interest?",
    emoji: "🔄",
    options: [
      { text: "Never heard of it", points: 0 },
      { text: "I know the term but not how it works", points: 1 },
      { text: "I understand the basic concept", points: 2 },
      { text: "I actively use it to grow my wealth", points: 3 },
    ],
  },
  {
    question: "Do you know what an ETF is?",
    emoji: "🏦",
    options: [
      { text: "No idea at all", points: 0 },
      { text: "I've heard of it, but not sure", points: 1 },
      { text: "I know it's a type of investment", points: 2 },
      { text: "Yes, I understand how they work", points: 3 },
      { text: "Yes, and I currently invest in them", points: 4 },
    ],
  },
  {
    question: "How much of your income do you typically save or invest?",
    emoji: "🐖",
    options: [
      { text: "0%", points: 0 },
      { text: "1% – 5%", points: 1 },
      { text: "6% – 15%", points: 2 },
      { text: "16% – 25%", points: 3 },
      { text: "More than 25%", points: 4 },
    ],
  },
  {
    question: "What is your timeline for needing investment returns?",
    emoji: "⏳",
    options: [
      { text: "Less than a year", points: 0 },
      { text: "1 to 3 years", points: 1 },
      { text: "4 to 7 years", points: 2 },
      { text: "More than 7 years", points: 3 },
      { text: "I'm investing for retirement", points: 4 },
    ],
  },
];

const LEVEL_DETAILS: Record<string, { tagline: string; description: string; color: string }> = {
  Rookie: {
    tagline: "Financial Beginner",
    description: "Your learning path starts with the fundamentals — budgeting, saving, and building healthy money habits. Every master was once a beginner!",
    color: "#34d399",
  },
  Explorer: {
    tagline: "Growing Investor",
    description: "You have solid basics! Your path focuses on intermediate concepts like debt management, investing fundamentals, and growing your wealth strategically.",
    color: "#38bdf8",
  },
  Master: {
    tagline: "Wealth Architect",
    description: "You're financially savvy! Your path covers advanced strategies — portfolio diversification, tax optimization, and building generational wealth.",
    color: "#a78bfa",
  },
};

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState<string | null>(null);
  const { completeOnboarding } = useAuth();

  const handleOptionSelect = async (points: number) => {
    const newScore = score + points;
    
    if (currentIdx < QUESTIONS.length - 1) {
      setScore(newScore);
      setCurrentIdx(currentIdx + 1);
    } else {
      let assignedLevel = "Rookie";
      if (newScore >= 13 && newScore <= 24) assignedLevel = "Explorer";
      if (newScore > 24) assignedLevel = "Master";
      
      setLevel(assignedLevel);
    }
  };

  const finishOnboarding = async () => {
    if (level) {
      await completeOnboarding(level);
    }
  };

  // ──── Results Screen ────
  if (level) {
    const details = LEVEL_DETAILS[level];
    return (
      <View className="flex-1 items-center justify-center bg-slate-950 px-6">
        <View className="items-center w-full">
          {/* Badge */}
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              borderWidth: 3,
              borderColor: details.color,
              backgroundColor: '#0f172a',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 40 }}>
              {level === "Rookie" ? "🌱" : level === "Explorer" ? "🧭" : "👑"}
            </Text>
          </View>

          <Text className="text-sm uppercase tracking-widest text-slate-400">
            Analysis Complete
          </Text>
          <Text className="mt-3 text-center text-3xl font-bold text-white">
            You are a{"\n"}
            <Text style={{ color: details.color }}>{level}</Text>
          </Text>
          <Text
            style={{ color: details.color }}
            className="mt-1 text-sm font-semibold"
          >
            {details.tagline}
          </Text>

          <View className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 w-full">
            <Text className="text-center text-sm leading-relaxed text-slate-300">
              {details.description}
            </Text>
          </View>
          
          <Pressable
            className="mt-8 w-full items-center rounded-full bg-emerald-400 px-4 py-4"
            onPress={finishOnboarding}
          >
            <Text className="text-base font-bold text-slate-950">
              Start My Journey →
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ──── Question Screen ────
  const q = QUESTIONS[currentIdx];
  const progress = ((currentIdx + 1) / QUESTIONS.length) * 100;

  return (
    <View className="flex-1 bg-slate-950 px-6 pt-16">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-white">FinMate</Text>
        <View className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
          <Text className="text-xs font-semibold text-emerald-400">
            {currentIdx + 1} of {QUESTIONS.length}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <View 
          className="h-1.5 bg-emerald-400 rounded-full" 
          style={{ width: `${progress}%` }} 
        />
      </View>

      {/* Emoji + Question */}
      <Text style={{ fontSize: 40, marginTop: 32 }}>{q.emoji}</Text>
      <Text className="mt-4 text-2xl font-bold leading-relaxed text-white">
        {q.question}
      </Text>

      {/* Options */}
      <View className="mt-8 gap-3">
        {q.options.map((opt, i) => (
          <Pressable
            key={i}
            className="rounded-2xl border border-slate-700 bg-slate-900 p-4 active:border-emerald-500 active:bg-emerald-900/20"
            onPress={() => handleOptionSelect(opt.points)}
          >
            <Text className="text-base font-semibold text-slate-200">
              {opt.text}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
