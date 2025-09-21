import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from "react-native";
import MainStyles from "../../StylingComponent/MainStyles";

export default function AddCredentialsScreen() {
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localMail, setLocalMail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const API_URL = "https://backend-1-60y9.onrender.com";

  const submit = async () => {
    setError("");
    setSuccess("");

    if (!site || !username || !userEmail || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      setIsSaving(true); // disable button + show loading
      await axios.post(`${API_URL}/creds`, {
        site,
        username,
        userEmail,
        password,
        email: localMail,
      });

      setSuccess("Credentials saved successfully!");
      setSite("");
      setUsername("");
      setUserEmail("");
      setPassword("");
    } catch (error: any) {
      setError("Something went wrong while saving the credentials.");
      console.log(error.message);
    } finally {
      setIsSaving(false); // re-enable button
    }
  };

  const getData = async () => {
    const email = await AsyncStorage.getItem("email");
    setLocalMail(email);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <ScrollView style={MainStyles.body}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Credentials</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Website / App Name"
          placeholderTextColor="#fff"
          value={site}
          onChangeText={setSite}
        />

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#fff"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#fff"
          value={userEmail}
          onChangeText={setUserEmail}
          keyboardType="email-address"
        />

        {/* Password with Eye Toggle */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginVertical: 0 }]}
            placeholder="Password"
            placeholderTextColor="#fff"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* ✅ Error / Success Messages */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <TouchableOpacity
          onPress={submit}
          style={[styles.submitBtn, isSaving && { opacity: 0.7 }]}
          disabled={isSaving}
        >
          {isSaving ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator size="small" color="#1c1a48" />
              <Text style={[styles.submitText, { marginLeft: 8 }]}>
                Saving...
              </Text>
            </View>
          ) : (
            <Text style={styles.submitText}>Save Credential</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  backBtn: {
    marginRight: 12,
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginLeft: "20%",
  },
  input: {
    backgroundColor: "#14145A",
    color: "#fff",
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 16,
    fontWeight: "500",
    width: "95%",
    marginHorizontal: "auto",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14145A",
    borderRadius: 10,
    width: "95%",
    alignSelf: "center",
    marginVertical: 8,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  successText: {
    color: "#00f2c2",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  submitBtn: {
    backgroundColor: "#00f2c2",
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    alignItems: "center",
    width: "95%",
    marginHorizontal: "auto",
  },
  submitText: {
    color: "#1c1a48",
    fontSize: 16,
    fontWeight: "700",
  },
});