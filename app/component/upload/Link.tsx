import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from "react-native";
import MainStyles from "../../StylingComponent/MainStyles";

export default function AddLinkScreen() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const API_URL = "https://backend-1-60y9.onrender.com";

  const submitData = async () => {
    setError("");
    setSuccess("");

    if (!title || !url) {
      setError("Both Title and URL fields are required.");
      return;
    }

    try {
      setIsSaving(true); // disable button + show loading
      await axios.post(`${API_URL}/link`, { title, url, email });

      setSuccess("Link saved successfully!");
      setTitle("");
      setUrl("");
    } catch (error: any) {
      setError("Something went wrong while saving the link.");
      console.log(error.message);
    } finally {
      setIsSaving(false); // re-enable button
    }
  };

  const getData = async () => {
    const mail = await AsyncStorage.getItem("email");
    setEmail(mail);
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
          <Text style={styles.headerTitle}>Add Link / Bookmark</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Enter link title"
          placeholderTextColor="#fff"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter URL"
          placeholderTextColor="#fff"
          value={url}
          onChangeText={setUrl}
          keyboardType="url"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <TouchableOpacity
          onPress={submitData}
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
            <Text style={styles.submitText}>Save Link</Text>
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