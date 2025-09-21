import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { router } from "expo-router";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function SignUp({ navigation }: any) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    let valid = true;
    let newErrors: any = {};

    if (!fullName) {
      newErrors.fullName = "Full name is required";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email";
      valid = false;
    }

    const passRegex = /^(?=.*[0-9]).{6,}$/;
    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (!passRegex.test(password)) {
      newErrors.password =
        "Password must be 6+ chars, include a number";
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
      valid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const API_URL = "https://backend-1-60y9.onrender.com/signup";

  const handleSignUp = async () => {
  if (validate()) {
    try {
      const res = await axios.post(API_URL, { 
        fullname: fullName, email, password });

      await AsyncStorage.setItem("isLoggedIn", "true");
      await AsyncStorage.setItem("email", email);
      console.log("Success:", res.data);
      router.push('/');
    } catch (error: any) {
      if (error.response) {
        alert(error.response.data.message || "Signup failed ❌");
        console.log("Backend Error:", error.response.data);
      } else {
        alert(error.message || "Network error ❌");
        console.log("Network Error:", error);
      }
    }
  }
};

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Securely store your documents.</Text>

      {/* Full Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#b5b5c3"
        value={fullName}
        onChangeText={setFullName}
      />
      {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#b5b5c3"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      {/* Password */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, borderWidth: 0, marginVertical: 0 }]}
          placeholder="Password"
          placeholderTextColor="#b5b5c3"
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
            color="#b5b5c3"
          />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, borderWidth: 0, marginVertical: 0 }]}
          placeholder="Confirm Password"
          placeholderTextColor="#b5b5c3"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={22}
            color="#b5b5c3"
          />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword}</Text>
      )}

      <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp}>
        <Text style={styles.signUpTxt}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>
        Already have an account?{" "}
        <Text
          style={styles.loginLink}
          onPress={() => router.push('/Registered/Login')}
        >
          Login
        </Text>
      </Text>

      <Text style={styles.terms}>
        By signing up, you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.07,
    paddingVertical: height * 0.05,
    backgroundColor: "#0a0c3f",
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#b5b5c3",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#12143f",
    width: "100%",
    color: "#fff",
    borderRadius: 10,
    padding: height * 0.018,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#1d204e",
    fontSize: width * 0.04,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#12143f",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1d204e",
    marginVertical: 10,
    paddingRight: 10,
    width: "100%",
  },
  eyeIcon: {
    paddingHorizontal: 5,
  },
  error: {
    color: "#88ecfdff",
    fontSize: width * 0.040,
    alignSelf: "flex-start",
    marginBottom: 5,
    fontWeight: 600,
  },
  signUpBtn: {
    backgroundColor: "#01dec8",
    width: "100%",
    padding: height * 0.018,
    borderRadius: 10,
    marginVertical: 15,
  },
  signUpTxt: {
    fontWeight: "600",
    fontSize: width * 0.045,
    color: "#0a0c3f",
    textAlign: "center",
  },
  orText: {
    color: "#b5b5c3",
    marginVertical: 10,
  },
  bioBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#01dec8",
    padding: height * 0.018,
    borderRadius: 10,
    width: "100%",
    justifyContent: "center",
    marginBottom: 20,
  },
  bioTxt: {
    color: "#01dec8",
    fontSize: width * 0.042,
    marginLeft: 8,
    fontWeight: "600",
  },
  loginText: {
    color: "#b5b5c3",
    fontSize: width * 0.04,
    marginBottom: 15,
  },
  loginLink: {
    color: "#01dec8",
    fontWeight: "600",
  },
  terms: {
    color: "#b5b5c3",
    fontSize: width * 0.033,
    textAlign: "center",
    marginTop: 5,
  },
  link: {
    color: "#01dec8",
    fontWeight: "600",
  },
});