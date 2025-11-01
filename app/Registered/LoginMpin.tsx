import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MainStyles from "../StylingComponent/MainStyles";

const { width, height } = Dimensions.get("window");

export default function LoginMPIN() {
  const [email, setEmail] = useState("");
  const [mpin, setMpin] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const inputs = useRef<(TextInput | null)[]>([]);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pin = mpin.join("");

    if (!email) {
      setError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setError("Enter a valid email");
      return false;
    }

    if (pin.length !== 6 || mpin.includes("")) {
      setError("Enter a valid 6-digit MPIN");
      return false;
    }

    setError("");
    return true;
  };

  const handleLogin = async () => {
    if (validate()) {
      try {
        const API_URL = "https://backend-1-60y9.onrender.com/login-mpin";

        const res = await axios.post(API_URL, { email, mpin: mpin.join("") });

        if (res.data.success) {
          setError("");
          console.log("Login success");
          await AsyncStorage.setItem("isLoggedIn", "true");
          await AsyncStorage.setItem("email", email);
          router.push("/");
        }
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Login failed ❌");
        }
      }
    }
  };

  const handleMpinChange = (text: string, index: number) => {
    if (/^[0-9]?$/.test(text)) {
      const newMpin = [...mpin];
      newMpin[index] = text;
      setMpin(newMpin);

      if (text && index < 5) {
        inputs.current[index + 1]?.focus();
      }
      if (!text && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={{marginTop: -100, marginBottom: 40}}>
        <Text style={styles.title}>Login With MPIN</Text>
        <Text style={styles.subtitle}>Enter your Email & MPIN</Text>
      </View>

      <View style={{width: '100%'}}>
        <Text style={[MainStyles.textWhite, styles.mpinText, {textAlign: "left"}]}>Enter Email</Text>
        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#b5b5c3"
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
        />
      </View>

        <View>
            <Text style={[MainStyles.textWhite, styles.mpinText]}>Enter Mpin</Text>
            {/* MPIN Boxes */}
            <View style={styles.mpinRow}>
                {mpin.map((digit, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => {inputs.current[index] = ref}}
                    style={styles.mpinBox}
                    keyboardType="numeric"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleMpinChange(text, index)}
                />
                ))}
            </View>
        </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginTxt}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.backText}>
        Don’t have an account?{" "}
        <Text
          style={styles.backLink}
          onPress={() => router.push("/Registered/Signup")}
        >
          Sign Up
        </Text>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.07,
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
    marginBottom: 45,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#12143f",
    width: "100%",
    color: "#fff",
    borderRadius: 10,
    padding: height * 0.018,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1d204e",
    fontSize: width * 0.04,
  },
  mpinRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  mpinBox: {
    backgroundColor: "#12143f",
    color: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1d204e",
    width: width * 0.12,
    height: width * 0.14,
    textAlign: "center",
    fontSize: width * 0.06,
    fontWeight: "600",
  },
  error: {
    color: "#88ecfdff",
    fontSize: width * 0.040,
    alignSelf: "flex-start",
    marginBottom: 10,
    fontWeight: 600
  },
  loginBtn: {
    backgroundColor: "#01dec8",
    width: "100%",
    padding: height * 0.018,
    borderRadius: 10,
    marginVertical: 15,
  },
  loginTxt: {
    fontWeight: "600",
    fontSize: width * 0.045,
    color: "#0a0c3f",
    textAlign: "center",
  },
  backText: {
    color: "#b5b5c3",
    fontSize: width * 0.04,
    marginTop: 10,
  },
  backLink: {
    color: "#01dec8",
    fontWeight: "600",
  },
  mpinText: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 500,
  }
});