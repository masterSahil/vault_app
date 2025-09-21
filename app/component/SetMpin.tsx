import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
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
import { useToast } from "react-native-toast-notifications";

const { width, height } = Dimensions.get("window");

export default function SetMPIN() {
  const [oldMpin, setOldMpin] = useState(Array(6).fill(""));
  const [newMpin, setNewMpin] = useState(Array(6).fill(""));
  const [confirmMpin, setConfirmMpin] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [hasOldMpin, setHasOldMpin] = useState(false); // 🔑 Track if user already has MPIN
  const toast = useToast();
  const navigation = useNavigation();

  const oldInputs = useRef<TextInput[]>([]);
  const newInputs = useRef<TextInput[]>([]);
  const confirmInputs = useRef<TextInput[]>([]);

  const handleChange = (
    text: string,
    index: number,
    type: "old" | "new" | "confirm"
  ) => {
    if (/^[0-9]?$/.test(text)) {
      const arr =
        type === "old"
          ? [...oldMpin]
          : type === "new"
          ? [...newMpin]
          : [...confirmMpin];
      arr[index] = text;
      if (type === "old") setOldMpin(arr);
      else if (type === "new") setNewMpin(arr);
      else setConfirmMpin(arr);

      const inputs =
        type === "old"
          ? oldInputs
          : type === "new"
          ? newInputs
          : confirmInputs;

      if (text && index < 5) inputs.current[index + 1]?.focus();
      if (!text && index > 0) inputs.current[index - 1]?.focus();
    }
  };

  const API_URL = "https://backend-1-60y9.onrender.com";

  const handleSave = async () => {
    const old = oldMpin.join("");
    const mpin = newMpin.join("");
    const confirm = confirmMpin.join("");

    // 🔑 If user already had MPIN, check old one
    if (hasOldMpin) {
      if (old.length !== 6 || oldMpin.includes("")) {
        return setError("⚠️ Please enter your old 6-digit MPIN.");
      }
    }

    if (mpin.length !== 6 || newMpin.includes("")) {
      return setError("⚠️ Please enter a valid 6-digit new MPIN.");
    }
    if (confirm.length !== 6 || confirmMpin.includes("")) {
      return setError("⚠️ Please confirm your new 6-digit MPIN.");
    }
    if (mpin !== confirm) {
      return setError("⚠️ New MPIN and Confirm MPIN do not match.");
    }

    setError("");
    try {
      const email = await AsyncStorage.getItem("email");
      const res = await axios.put(`${API_URL}/set-mpin`, {
        email,
        old: hasOldMpin ? old : null, // send old only if required
        mpin,
      });
      if (res.data.success) {
        toast.show("✅ Your MPIN has been updated successfully!", {
          type: "success",
        });
        navigation.goBack();
      } else setError(res.data.message);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("❌ Failed to update MPIN. Try again.");
      }
      console.log("Error:", err.response?.data || err.message);
    }
  };

  const getData = async () => {
    try {
      const email = await AsyncStorage.getItem("email");
      if (!email) return;

      const res = await axios.post(`${API_URL}/findUser`, { email });
      console.log("User data:", res.data.user);

      if (res.data.user?.mpin) {
        setHasOldMpin(true); // user has an MPIN already
      } else {
        setHasOldMpin(false); // no MPIN set yet
      }
    } catch (err) {
      console.log("❌ Error fetching user:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Set Your MPIN</Text>
      </View>

      <Text style={styles.subtitle}>
        Secure your account with a 6-digit MPIN for quick login.
      </Text>

      {/* Show Old MPIN input ONLY if user already has one */}
      {hasOldMpin && (
        <>
          <Text style={styles.label}>Enter Old MPIN</Text>
          <View style={styles.mpinRow}>
            {oldMpin.map((d, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  oldInputs.current[i] = ref as TextInput;
                }}
                style={styles.mpinBox}
                keyboardType="numeric"
                maxLength={1}
                value={d}
                onChangeText={(t) => handleChange(t, i, "old")}
              />
            ))}
          </View>
        </>
      )}

      {/* New MPIN */}
      <Text style={styles.label}>Enter New MPIN</Text>
      <View style={styles.mpinRow}>
        {newMpin.map((d, i) => (
          <TextInput
            key={i}
            ref={(ref) => {
              newInputs.current[i] = ref as TextInput;
            }}
            style={styles.mpinBox}
            keyboardType="numeric"
            maxLength={1}
            value={d}
            onChangeText={(t) => handleChange(t, i, "new")}
          />
        ))}
      </View>

      {/* Confirm MPIN */}
      <Text style={styles.label}>Confirm MPIN</Text>
      <View style={styles.mpinRow}>
        {confirmMpin.map((d, i) => (
          <TextInput
            key={i}
            ref={(ref) => {
              confirmInputs.current[i] = ref as TextInput;
            }}
            style={styles.mpinBox}
            keyboardType="numeric"
            maxLength={1}
            value={d}
            onChangeText={(t) => handleChange(t, i, "confirm")}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveTxt}>Save MPIN</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        This MPIN is for device-specific quick access. Your main password
        remains unchanged.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0c3f",
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.07,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "700",
    color: "#fff",
    marginLeft: "20%",
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#b5b5c3",
    marginBottom: 45,
    textAlign: "center",
  },
  label: {
    fontSize: width * 0.045,
    color: "#b5b5c3",
    marginBottom: 10,
  },
  mpinRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
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
    fontSize: width * 0.04,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: 600,
  },
  saveBtn: {
    backgroundColor: "#01dec8",
    width: "100%",
    padding: height * 0.018,
    borderRadius: 10,
    marginVertical: 15,
  },
  saveTxt: {
    fontWeight: "600",
    fontSize: width * 0.045,
    color: "#0a0c3f",
    textAlign: "center",
  },
  footerText: {
    color: "#b5b5c3",
    fontSize: width * 0.035,
    textAlign: "center",
    marginTop: 20,
  },
});