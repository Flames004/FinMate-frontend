import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5000";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatbotModal() {
  const { userToken } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your FinMate AI. Ask me any finance-related questions!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    // Map messages specifically for Ollama format:
    // Strip "id" property, leaving just 'role' and 'content' 
    const historyPayload = [...messages, userMessage].map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await axios.post(`${BASE_URL}/api/chat`, {
        messages: historyPayload,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.reply.content,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Chat API Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          error.response?.data?.error ||
          "Sorry, I couldn't reach the server right now. Ensure Ollama is running and Llama3 is installed.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderBubble = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        className={`mb-4 px-4 py-3 rounded-2xl max-w-[85%] ${
          isUser
            ? "bg-emerald-500 self-end rounded-br-sm"
            : "bg-slate-700 self-start rounded-bl-sm"
        }`}
      >
        <Text className="text-white text-base leading-relaxed">
          {item.content}
        </Text>
      </View>
    );
  };

  // Do not render the chatbot components on Auth/OTP screens
  // MUST be placed here to prevent React Hook order violations
  if (!userToken) return null;

  return (
    <>
      {/* Floating Action Button */}
      {!modalVisible && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute bottom-24 right-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg transform active:scale-95"
          style={{ zIndex: 1000, elevation: 10, shadowColor: "#10b981", shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
        >
          <Ionicons name="chatbubbles" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Chat Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, marginTop: 48 }}
          className="w-full bg-slate-900 rounded-t-3xl shadow-xl overflow-hidden shadow-black"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
            <View className="flex-row items-center space-x-3">
              <View className="bg-emerald-500/20 p-2 rounded-full">
                <Ionicons name="sparkles" size={20} color="#10b981" />
              </View>
              <Text className="text-white text-lg font-bold">FinMate AI</Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="p-2 rounded-full bg-slate-800"
            >
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Chat Area */}
          <View style={{ flex: 1 }} className="bg-slate-800">
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderBubble}
              contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 10 }}
              style={{ flex: 1 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          </View>

          {/* Input Area */}
          <View className="px-4 py-3 bg-slate-900 border-t border-slate-800">
            <View className="flex-row items-center bg-slate-800 rounded-full pl-4 pr-1 py-1">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask a financial question..."
                placeholderTextColor="#64748b"
                className="flex-1 h-12 text-white font-medium"
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity
                onPress={sendMessage}
                disabled={loading || !inputText.trim()}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  inputText.trim() ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons
                    name="send"
                    size={18}
                    color={inputText.trim() ? "white" : "#94a3b8"}
                    style={{ marginLeft: 3 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
