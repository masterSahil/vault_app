import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import MainStyles from "../../StylingComponent/MainStyles";

export default function AddNotesScreen() {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [localEmail, setLocalEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "https://backend-1-60y9.onrender.com";

  const submitData = async () => {
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!note.trim()) {
      setError("Note cannot be empty.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/note`, {
        title,
        note,
        email: localEmail,
      });

      // ✅ safer success check
      if (res?.data) {
        setSuccess("Note saved successfully!");
        setTitle("");
        setNote("");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.log("Error saving note:", error.message);
      setError("Failed to save note. Check your connection.");
    }
  };

  const getData = async () => {
    const email = await AsyncStorage.getItem("email");
    if (email) setLocalEmail(email);
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
          <Text style={styles.headerTitle}>Add Notes</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Enter note title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, { height: 150 }]}
          placeholder="Write your secret or note here..."
          placeholderTextColor="#aaa"
          value={note}
          onChangeText={setNote}
          multiline
        />

        {/* ✅ Show Error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* ✅ Show Success */}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <TouchableOpacity onPress={submitData} style={styles.submitBtn}>
          <Text style={styles.submitText}>Save Note</Text>
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
    marginLeft: "25%",
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
    alignSelf: "center",
  },
  submitBtn: {
    backgroundColor: "#00f2c2",
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    alignItems: "center",
    width: "95%",
    alignSelf: "center",
  },
  submitText: {
    color: "#1c1a48",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500", // ✅ fixed
    marginBottom: 10,
  },
  successText: {
    color: "#00f2c2",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500", // ✅ fixed
    marginBottom: 10,
  },
});