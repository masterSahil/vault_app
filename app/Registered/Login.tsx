import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MainStyles from "../StylingComponent/MainStyles";

const { width, height } = Dimensions.get("window");
const API_URL = "https://backend-1-60y9.onrender.com/login";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key: "email" | "password", value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email";

    if (!form.password) newErrors.password = "Password is required";
    else if (!/^(?=.*[0-9]).{6,}$/.test(form.password))
      newErrors.password = "Min 6 chars & include a number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const res = await axios.post(API_URL, form);

      if (res.data.success) {
        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("email", form.email);
        router.push("/component/Home");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Something went wrong";
      setErrors({ server: msg });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={MainStyles.body}
      keyboardShouldPersistTaps="handled"
    >
      {/* Heading */}
      <View style={styles.loginContainer}>
        <Text style={[MainStyles.textWhite, MainStyles.Headings, MainStyles.textCenter]}>
          Digital Locker
        </Text>
        <Text style={[MainStyles.textWhite, MainStyles.subHeading, MainStyles.textCenter]}>
          Welcome Back! Securely access your documents.
        </Text>
      </View>

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#fff"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(v) => handleChange("email", v)}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      {/* Password */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginVertical: 0, borderWidth: 0 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          placeholderTextColor="#fff"
          value={form.password}
          onChangeText={(v) => handleChange("password", v)}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}
      {errors.server && <Text style={styles.error}>{errors.server}</Text>}

      {/* Forgot Password */}
      <Text onPress={()=>router.push('/Registered/LoginMpin')} style={styles.forgot}>Forgot Password?</Text>

      {/* Login Button */}
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={[MainStyles.textWhite, styles.btnTxt]}>Login</Text>
      </TouchableOpacity>

      {/* Social Login */}
      <Text style={[styles.txt, MainStyles.textCenter]}>Or Continue With</Text>

      <TouchableOpacity onPress={()=>router.push('/Registered/LoginMpin')} style={styles.bioBtn}>
        <Ionicons name="lock-closed" size={22} color="#01dec8" />
        <Text style={styles.bioTxt}>Log in with MPIN</Text>
      </TouchableOpacity>

      {/* Signup Link */}
      <Text style={styles.signupText} onPress={() => router.push("/Registered/Signup")}>
        Don’t have an account? <Text style={styles.signupLink}>Sign Up</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.04,
  },
  loginContainer: { marginBottom: height * 0.06 },
  input: {
    backgroundColor: "transparent",
    color: "#fff",
    borderRadius: 8,
    padding: height * 0.02,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 224, 198, 0.3)",
    fontSize: width * 0.045,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 224, 198, 0.3)",
    borderRadius: 8,
    marginVertical: 10,
    paddingRight: 10,
  },
  eyeIcon: { paddingHorizontal: 5 },
  error: {
    color: "#88ecfdff",
    fontWeight: "600",
    fontSize: width * 0.04,
    marginTop: -5,
    marginBottom: 8,
  },
  forgot: {
    color: "#12c2e9",
    textAlign: "right",
    marginVertical: 8,
    fontWeight: "500",
    fontSize: width * 0.035,
  },
  btn: {
    backgroundColor: "#01dec8",
    padding: height * 0.014,
    marginVertical: 12,
    borderRadius: 10,
  },
  btnTxt: {
    fontWeight: "600",
    fontSize: width * 0.045,
    color: "#0a0c3f",
    textAlign: "center",
  },
  bioBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#01dec8",
    padding: height * 0.018,
    borderRadius: 10,
    justifyContent: "center",
    marginBottom: 20,
  },
  bioTxt: { color: "#01dec8", fontSize: width * 0.042, marginLeft: 8, fontWeight: "600" },
  txt: { color: "#b5b5c3", marginBottom: 20, marginTop: 10, },
  signupText: { textAlign: "center", color: "#b5b5c3", fontSize: width * 0.04 },
  signupLink: { color: "#01dec8", fontWeight: "600" },
});