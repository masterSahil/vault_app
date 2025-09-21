import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function SettingsScreen() {
  const [editMode, setEditMode] = useState(false);
  const [userName, setUserName] = useState("");
  const [userMail, setUserMail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const API_URL = "https://backend-1-60y9.onrender.com";

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("isLoggedIn");
      await AsyncStorage.removeItem("email");
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const getData = async () => {
    try {
      const email = await AsyncStorage.getItem("email");
      setUserMail(email || "");

      const res = await axios.post(`${API_URL}/findUser`, { email });
      setUserName(res.data.user.fullname);
    } catch (err) {
      console.log("Error:", err.message);
    }
  };

  const updateProfile = async () => {
    try {
      const email = await AsyncStorage.getItem("email");
      const res = await axios.put(`${API_URL}/updateUser`, {
        oldEmail: email,
        email: userMail,
        fullname: userName,
      });

      await AsyncStorage.removeItem("email");
      await AsyncStorage.setItem("email", userMail);

      setEditMode(false);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updatePassword = async () => {
    if (!oldPassword || !newPassword) {
      setPasswordError("Please enter both old and new password");
      return;
    }
    try {
      const email = await AsyncStorage.getItem("email");
      const res = await axios.put(`${API_URL}/updatePassword`, {
        email: email,
        oldPassword,
        newPassword,
      });
      console.log(res.data);
      Alert.alert("Success", res.data.message || "Password updated");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      // Alert.alert("Error", err.message);
      console.log("Error:", err.response?.data || err.message);
      setPasswordError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <Ionicons
            name={editMode ? "checkmark" : "create"}
            size={24}
            color="#08deff"
          />
        </TouchableOpacity>
      </View>

      {/* Inputs Section */}
      <View style={styles.section}>
        <Label text="Name" />
        <TextInput
          style={styles.input}
          value={userName}
          onChangeText={setUserName}
          editable={editMode}
          placeholder="Enter your name"
          placeholderTextColor="#777"
        />

        <Label text="Email" />
        <TextInput
          style={styles.input}
          value={userMail}
          onChangeText={setUserMail}
          editable={editMode}
          placeholder="Enter your email"
          placeholderTextColor="#777"
          keyboardType="email-address"
        />

        {editMode && (
          <TouchableOpacity style={styles.saveBtn} onPress={updateProfile}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Password Update */}
      <View style={styles.section}>
        <Label text="Old Password" />
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Enter old password"
            placeholderTextColor="#777"
            secureTextEntry={!showOldPassword}
          />
          <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
            <Ionicons
              name={showOldPassword ? "eye-off" : "eye"}
              size={22}
              color="#bbb"
            />
          </TouchableOpacity>
        </View>

        <Label text="New Password" />
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor="#777"
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <Ionicons
              name={showNewPassword ? "eye-off" : "eye"}
              size={22}
              color="#bbb"
            />
          </TouchableOpacity>
        </View>

        {/* ⬇️ Inline backend error paragraph */}
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        <TouchableOpacity style={styles.saveBtn} onPress={updatePassword}>
          <Text style={styles.saveText}>Update Password</Text>
        </TouchableOpacity>
      </View>

      {/* Other Settings */}
      <View style={styles.section}>
        <SettingItem label="Set New MPIN" onPress={() => router.push("/component/SetMpin")} />
        <SettingItem label="Logout" onPress={logout} danger />
      </View>
    </ScrollView>
  );
}

/* Reusable Components with Props */
type LabelProps = { text: string };
const Label: React.FC<LabelProps> = ({ text }) => (
  <Text style={styles.label}>{text}</Text>
);

type SettingItemProps = {
  label: string;
  onPress: () => void;
  danger?: boolean;
};
const SettingItem: React.FC<SettingItemProps> = ({ label, onPress, danger }) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <Text style={[styles.itemLabel, danger && { color: "#ff4d4d" }]}>{label}</Text>
    <Ionicons
      name="chevron-forward"
      size={20}
      color={danger ? "#ff4d4d" : "#08deff"}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0c3f",
    paddingHorizontal: 18,
  },
  header: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: width * 0.055,
    fontWeight: "700",
    color: "#fff",
  },
  section: {
    marginTop: 30,
    backgroundColor: "#14185b",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c2066",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#fff",
    fontSize: width * 0.04,
  },
  label: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#bbb",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#1c2066",
    padding: 12,
    borderRadius: 10,
    color: "#fff",
    fontSize: width * 0.04,
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#3a3f95",
  },
  itemLabel: {
    fontSize: width * 0.042,
    fontWeight: "600",
    color: "#fff",
  },
  saveBtn: {
    backgroundColor: "#086bffff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  errorText: {          
    color: "#88ecfdff",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
});