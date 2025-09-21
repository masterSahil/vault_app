import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import MainStyles from "../../StylingComponent/MainStyles";

export default function UploadDocumentScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const API_URL = "https://backend-1-60y9.onrender.com/files"; 

  // Pick file
  const pickFile = async () => {
    setStatus(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled) setFile(result.assets[0]);
  };

  // Get email from AsyncStorage
  const loadEmail = async () => {
    const stored = await AsyncStorage.getItem("email");
    if (stored) setEmail(stored);
  };

  // Upload file
  const uploadFile = async () => {
    setStatus(null);

    if (!file) return setStatus({ type: "error", msg: "Please select a file first." });
    if (!title.trim()) return setStatus({ type: "error", msg: "Please enter a title." });

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.mimeType || "application/octet-stream",
      name: file.name,
    } as any);
    formData.append("title", title);
    formData.append("email", email);
    if (description.trim()) formData.append("description", description);

    try {
      setUploading(true);
      await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus({ type: "success", msg: "File uploaded successfully!" });
      setFile(null);
      setTitle("");
      setDescription("");
    } catch (err: any) {
      setStatus({ type: "error", msg: err.response?.data?.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadEmail();
  }, []);

  return (
    <ScrollView style={MainStyles.body}>
      <SafeAreaView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Any File</Text>
        </View>

        {/* Title */}
        <TextInput
          style={styles.input}
          placeholder="Enter file title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Enter file description (optional)"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* File Picker */}
        <TouchableOpacity style={styles.uploadCard} onPress={pickFile}>
          <Ionicons name="cloud-upload-outline" size={36} color="#00f2c2" />
          <Text style={styles.uploadText}>Tap to select a file</Text>
          <Text style={styles.subText}>Supports PDF, DOCX, XLSX, images, videos, etc.</Text>
        </TouchableOpacity>

        {/* File Info */}
        {file && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>📂 {file.name}</Text>
            <Text style={styles.fileDetails}>Size: {(file.size / 1024).toFixed(1)} KB</Text>
          </View>
        )}

        {/* Messages */}
        {status && (
          <Text style={status.type === "error" ? styles.errorText : styles.successText}>
            {status.msg}
          </Text>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.submitBtn, uploading && { opacity: 0.7 }]}
          onPress={uploadFile}
          disabled={uploading}
        >
          {uploading ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator size="small" color="#1c1a48" />
              <Text style={[styles.submitText, { marginLeft: 8 }]}>Uploading...</Text>
            </View>
          ) : (
            <Text style={styles.submitText}>Upload</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginVertical: 30 },
  backBtn: { marginRight: 12, padding: 6 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff", marginLeft: "20%" },
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
  uploadCard: {
    backgroundColor: "#14145A",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "95%",
    alignSelf: "center",
    marginTop: 20,
  },
  uploadText: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 12 },
  subText: { color: "#aaa", fontSize: 12, marginTop: 4, textAlign: "center" },
  fileInfo: { marginTop: 20, alignItems: "center" },
  fileName: { color: "#fff", fontSize: 14, marginBottom: 4 },
  fileDetails: { color: "#aaa", fontSize: 12 },
  errorText: {
    color: "#ff4d4d",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  successText: {
    color: "#00f2c2",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
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
  submitText: { color: "#1c1a48", fontSize: 16, fontWeight: "700" },
});