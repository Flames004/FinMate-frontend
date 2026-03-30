import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import MODULE_CONTENT from "../data/moduleContent.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncData } from "../services/authService";
import MODULES_DATA from "../data/modules.json";
import { useAuth } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Module">;

export default function ModuleScreen({ route, navigation }: Props) {
  const { moduleId } = route.params;
  const moduleData = (MODULE_CONTENT as any)[moduleId];

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

  const handleOptionSelect = (quizIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedOptions((prev) => ({ ...prev, [quizIndex]: optionIndex }));
  };

  const { userData, updateUserData } = useAuth();

  const handleSubmit = async () => {
    if (Object.keys(selectedOptions).length < moduleData.quizzes.length) {
      return; 
    }

    setIsSubmitted(true);

    const isAllCorrect = moduleData.quizzes.every(
      (q: any, i: number) => q.correctIndex === selectedOptions[i]
    );

    if (isAllCorrect) {
      try {
        const newProgressMap = { ...userData.progressMap, [moduleId]: 100 };
        await updateUserData({ progressMap: newProgressMap });
      } catch (e) {
        console.error("Failed to save progress", e);
      }
    }
  };

  const retryQuiz = () => {
    setIsSubmitted(false);
    setSelectedOptions({});
  };

  const goBack = () => {
    navigation.goBack();
  };

  // ──── Module Not Found ────
  if (!moduleData) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950 px-6">
        <Text style={{ fontSize: 48 }}>🚧</Text>
        <Text className="mt-4 text-2xl font-bold text-white text-center">
          Module Coming Soon
        </Text>
        <Text className="mt-2 text-slate-400 text-center">
          This lesson is currently being prepared. Check back later!
        </Text>
        <Pressable
          className="mt-8 rounded-full bg-emerald-400 px-8 py-3"
          onPress={goBack}
        >
          <Text className="text-slate-950 font-bold">← Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const allAnswered = Object.keys(selectedOptions).length === moduleData.quizzes.length;
  const isAllCorrect = isSubmitted && moduleData.quizzes.every(
    (q: any, i: number) => q.correctIndex === selectedOptions[i]
  );

  return (
    <ScrollView className="flex-1 bg-slate-950 px-6 pt-16 pb-20">
      {/* Back navigation */}
      <Pressable onPress={goBack} className="mb-6 flex-row items-center">
        <Text className="text-emerald-400 font-semibold">← Back to Learning Path</Text>
      </Pressable>

      {/* Module Title */}
      <Text className="text-3xl font-bold text-white">{moduleData.title}</Text>
      <View className="flex-row items-center mt-2 gap-2">
        <View className="rounded-full bg-emerald-900/30 border border-emerald-800 px-3 py-0.5">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            Lesson
          </Text>
        </View>
        <View className="rounded-full bg-slate-800 border border-slate-700 px-3 py-0.5">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {moduleData.quizzes.length} Quiz Questions
          </Text>
        </View>
      </View>

      {/* ──── Content Section ──── */}
      <View className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <View className="flex-row items-center mb-4">
          <Text style={{ fontSize: 20 }}>📖</Text>
          <Text className="ml-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
            Study Material
          </Text>
        </View>
        <Text className="text-base text-slate-200 leading-7">
          {moduleData.content}
        </Text>
      </View>

      {/* ──── Quiz Section ──── */}
      <View className="mt-10 flex-row items-center mb-6">
        <Text style={{ fontSize: 20 }}>✍️</Text>
        <Text className="ml-2 text-xl font-bold text-white">Knowledge Check</Text>
      </View>
      
      {moduleData.quizzes.map((quiz: any, quizIndex: number) => (
        <View key={quizIndex} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 mb-5">
          <Text className="text-sm font-bold text-emerald-400 mb-1">
            Question {quizIndex + 1}
          </Text>
          <Text className="text-base font-semibold text-white mb-4 leading-relaxed">
            {quiz.question}
          </Text>

          <View className="gap-2">
            {quiz.options.map((option: string, optionIndex: number) => {
              const isSelected = selectedOptions[quizIndex] === optionIndex;
              const isCorrect = quiz.correctIndex === optionIndex;
              
              let borderStyle = "border-slate-700";
              let bgStyle = "bg-slate-800/60";
              let textStyle = "text-slate-200";
              let indicator = "";

              if (isSubmitted) {
                if (isCorrect) {
                  borderStyle = "border-emerald-500";
                  bgStyle = "bg-emerald-900/20";
                  textStyle = "text-emerald-400";
                  indicator = " ✓";
                } else if (isSelected && !isCorrect) {
                  borderStyle = "border-red-500";
                  bgStyle = "bg-red-900/20";
                  textStyle = "text-red-400";
                  indicator = " ✗";
                }
              } else if (isSelected) {
                borderStyle = "border-emerald-500";
                bgStyle = "bg-emerald-900/15";
                textStyle = "text-emerald-300";
              }

              return (
                <Pressable
                  key={optionIndex}
                  disabled={isSubmitted}
                  onPress={() => handleOptionSelect(quizIndex, optionIndex)}
                  className={`rounded-xl border ${borderStyle} ${bgStyle} p-4 flex-row items-center justify-between`}
                >
                  <Text className={`text-sm font-semibold ${textStyle} flex-1`}>
                    {option}
                  </Text>
                  {indicator !== "" && (
                    <Text className={`text-base font-bold ${textStyle} ml-2`}>
                      {indicator}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      {/* ──── Submit / Results ──── */}
      {!isSubmitted ? (
        <Pressable
          disabled={!allAnswered}
          className={`w-full items-center rounded-full py-4 mb-10 ${allAnswered ? 'bg-emerald-400' : 'bg-slate-800'}`}
          onPress={handleSubmit}
        >
          <Text className={`text-base font-bold ${allAnswered ? 'text-slate-950' : 'text-slate-500'}`}>
            {allAnswered ? "Submit Answers" : `Answer all ${moduleData.quizzes.length} questions`}
          </Text>
        </Pressable>
      ) : (
        <View className="mt-2 mb-10 items-center rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <Text style={{ fontSize: 48 }}>
            {isAllCorrect ? "🎉" : "📚"}
          </Text>
          <Text className={`mt-4 text-2xl font-bold ${isAllCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isAllCorrect ? "Module Mastered!" : "Keep Learning!"}
          </Text>
          <Text className="mt-2 text-slate-300 text-center leading-relaxed">
            {isAllCorrect 
              ? "Excellent! You've passed this module. Your progress on the learning path has been updated."
              : "Review the study material above and try the quiz again to complete this module."}
          </Text>
          
          {isAllCorrect ? (
            <Pressable
              className="mt-6 w-full items-center rounded-full bg-emerald-400 py-3"
              onPress={goBack}
            >
              <Text className="text-base font-bold text-slate-950">
                Continue Journey →
              </Text>
            </Pressable>
          ) : (
            <Pressable
              className="mt-6 w-full items-center rounded-full border border-amber-500 bg-transparent py-3"
              onPress={retryQuiz}
            >
              <Text className="text-base font-bold text-amber-400">
                Retry Quiz
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  );
}
