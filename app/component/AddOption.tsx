import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AddOptionsScreen() {
  const options = [
    {
      icon: "document-text-outline",
      title: "Add Notes / Secrets",
      description: "Save personal notes and secrets securely",
      screen: "/component/upload/Notes",
    },
    {
      icon: "folder-outline",
      title: "Add Files / Docs",
      description: "Upload documents, PDFs, or images",
      screen: "/component/upload/DocFile",
    },
    {
      icon: "link-outline",
      title: "Add Link / Bookmark",
      description: "Save your favorite websites and resources",
      screen: "/component/upload/Link",
    },
    {
      icon: "key-outline",
      title: "Add Credentials",
      description: "Securely store usernames and passwords",
      screen: "/component/upload/Credentials",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* 🔹 Header with Back + Title */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Add New</Text>
      </View>

      {/* 🔹 Options */}
      <View style={styles.optionsWrapper}>
        {options.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card}
            onPress={() => router.push(item.screen)} >
            <Ionicons name={item.icon} size={28} color="#00E0C7" />
            <View style={styles.textWrapper}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B45",
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBlock: 30,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginLeft: '25%',
  },
  optionsWrapper: {
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14145A",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  textWrapper: {
    marginLeft: 14,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  description: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 4,
  },
});