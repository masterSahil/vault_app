import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import Svg, { Line } from "react-native-svg";

const { width } = Dimensions.get("window");
const CARD_SIZE = width / 2.38;

const categories = [
  { name: "Notes/Secrets", icon: "mail-outline", link: "/component/view/Notes" },
  { name: "Files/Docs", icon: "document-outline", link: "/component/view/Docs" },
  { name: "Link/Bookmark", icon: "medkit-outline", link: "/component/view/Link" },
  { name: "Credentials", icon: "lock-closed-outline", link: "/component/view/Creds" },
];

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const API_URL = "https://backend-1-60y9.onrender.com";
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults(null);
      setShowOverlay(false);
      return;
    }
    try {
      setLoading(true);
      setShowOverlay(true); 
      const email = await AsyncStorage.getItem("email");
      const findUser = await axios.post(`${API_URL}/findUser`, { email });
      const userId = findUser.data.user._id;

      const res = await axios.get(`${API_URL}/search`, {
        params: { q: query, userId }   // send userId
      });


      const filtered = {
        notes: res.data.notes?.filter((n: any) => n.userId === userId) || [],
        docs: res.data.docs?.filter((d: any) => d.userId === userId) || [],
        links: res.data.links?.filter((l: any) => l.userId === userId) || [],
        creds: res.data.creds?.filter((c: any) => c.userId === userId) || [],
      };

      setResults(filtered);
    } catch (err) {
      console.error("Search error:", err);
      setResults(null);
    } finally {
      setLoading(false);
      Keyboard.dismiss();
    }
  };

  const renderResultCard = (item: any, type: string) => {
    let title = "";
    let subtitle = "";
    let link = "";

    switch (type) {
      case "docs":
        title = item.title;
        subtitle = item.description;
        link = "/component/view/Docs";
        break;
      case "links":
        title = item.title || item.url;
        subtitle = item.url;
        link = "/component/view/Link";
        break;
      case "creds":
        title = item.username;
        subtitle = item.site;
        link = "/component/view/Creds";
        break;
      case "notes":
        title = item.title;
        subtitle = item.content;
        link = "/component/view/Notes";
        break;
    }

    return (
      <TouchableOpacity
        key={item._id}
        style={styles.resultCard}
        onPress={() => {
          setShowOverlay(false);
          router.push(link);
        }}
      >
        <Ionicons name="search-outline" size={22} color="#00f2c2" />
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle}>{title}</Text>
          {type != "notes" && (
            <Text style={styles.resultSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          <Text style={styles.resultTag}>{type.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ Check if all result arrays are empty
  const isResultsEmpty =
    results &&
    ["notes", "docs", "links", "creds"].every(
      (section) => !results[section] || results[section].length === 0
    );

  return (
    <View style={styles.container}>
      {/* Main Scrollable Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Home Dashboard</Text>
          <TouchableOpacity onPress={() => router.push("/component/Settings")}>
            <Ionicons name="settings-outline" size={24} color="#00f2c2" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#aaa" />
          <TextInput
            placeholder="Search documents"
            placeholderTextColor="#aaa"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch} // ✅ run only on enter/tick
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setResults(null);
                setShowOverlay(false);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.grid}>
          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => router.push(item.link)}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={28}
                color="#00f2c2"
              />
              <Text style={styles.cardText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/component/AddOption")}
        >
          <LinearGradient
            colors={["#00f2c2", "#0088ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabButton}
          >
            <Svg
              width={32}
              height={32}
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Line x1="12" y1="5" x2="12" y2="19" />
              <Line x1="5" y1="12" x2="19" y2="12" />
            </Svg>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Search Results Overlay */}
      <Modal
        visible={showOverlay}
        animationType="fade"
        transparent
        onRequestClose={() => setShowOverlay(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.overlayBox}>
            {loading ? (
              <ActivityIndicator color="#00f2c2" size="large" style={{ margin: 20 }} />
            ) : isResultsEmpty ? (
              <Text style={styles.noResults}>No results found</Text>
            ) : (
              <ScrollView>
                {results &&
                  ["notes", "docs", "links", "creds"].map((section) =>
                    results[section]?.length > 0 ? (
                      <View key={section} style={{ marginBottom: 15 }}>
                        <Text style={styles.overlaySection}>
                          {section.charAt(0).toUpperCase() + section.slice(1)}
                        </Text>
                        {results[section].map((item: any) =>
                          renderResultCard(item, section)
                        )}
                      </View>
                    ) : null
                  )}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowOverlay(false)}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0c3f", paddingHorizontal: 8 },
  header: {
    marginTop: 50,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1a48",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchInput: { flex: 1, marginLeft: 8, color: "#fff", fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#fff", marginVertical: 16, marginBottom: 30 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 5,
    paddingHorizontal: 4,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 0.7,
    backgroundColor: "#1c1a48",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#00f2c2",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardText: { marginTop: 8, color: "#fff", fontSize: 15, fontWeight: "500" },
  fabContainer: { position: "absolute", bottom: 30, right: 20 },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00f2c2",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayBox: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#0a0c3f",
    borderRadius: 10,
    padding: 16,
  },
  overlaySection: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00f2c2",
    marginBottom: 8,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1a48",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  resultTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  resultSubtitle: { color: "#aaa", fontSize: 13, marginTop: 2 },
  resultTag: { marginTop: 4, fontSize: 11, color: "#00f2c2", fontWeight: "500" },
  closeBtn: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "#0088ff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resultContent: { flex: 1, marginLeft: 8, justifyContent: "center" },
  noResults: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 20,
  },
});
