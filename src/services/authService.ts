import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace with your actual local IP address if testing on a physical device
const API_URL = "http://10.76.140.41:5000/api/users"; 

export const sendOtp = async (email: string) => {
  try {
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to send OTP";
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    if (response.data.success && response.data.token) {
      await AsyncStorage.setItem("@finmate_token", response.data.token);
    }
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Invalid OTP";
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem("@finmate_token");
};

export const getToken = async () => {
  return await AsyncStorage.getItem("@finmate_token");
};

export const getMe = async () => {
  try {
    const token = await getToken();
    if (!token) return null;
    
    const response = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateProfile = async (name: string) => {
  try {
    const token = await getToken();
    if (!token) throw "No token found";

    const response = await axios.put(`${API_URL}/profile`, { name }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update profile";
  }
};

export const syncData = async (data: any) => {
  try {
    const token = await getToken();
    if (!token) return null;

    const response = await axios.post(`${API_URL}/sync`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Sync error:", error);
    return null;
  }
};
