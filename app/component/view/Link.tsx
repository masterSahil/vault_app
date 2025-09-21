import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import Toast from "react-native-toast-message";

type Link = {
  _id: string;
  title: string;
  url: string;
  createdAt?: string | number;
};

export default function LinksScreen() {
  const [visibleLinks, setVisibleLinks] = useState<Record<string, boolean>>({});
  const [links, setLinks] = useState<Link[]>([]);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const API_URL = "https://backend-1-60y9.onrender.com";

  const formatDate = (timestamp?: string | number): string => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp));
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getData = async () => {
    try {
      Toast.show({
        type: "info",
        text1: "Loading Links...",
        autoHide: false,
      });
      const res = await axios.get<{ link: Link[] }>(`${API_URL}/link`);
      const email = await AsyncStorage.getItem("email");

      const user = await axios.post(`${API_URL}/findUser`, { email });
      const linkData = res.data.link;

      const matched = linkData.filter(
        (link) => link.userId === user.data.user._id
      );

      setLinks(matched || []);
      Toast.hide();
      Toast.show({
        type: "success",
        text1: "Links loaded Successfully",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to load links",
        text2: "Please try again later.",
      });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const toggleLink = (id: string) => {
    setVisibleLinks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const deleteLink = (id: string) => {
    Alert.alert("Delete Link", "Are you sure you want to delete this link?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/link/${id}`);
            getData(); // refresh list
            Toast.show({
              type: "success",
              text1: "Link deleted successfully",
            });
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "Delete failed",
            });
          }
        },
      },
    ]);
  };

  const editLink = (link: Link) => {
    setEditingLink(link._id);
    setEditTitle(link.title);
    setEditUrl(link.url);
  };

  const saveEdit = async () => {
    if (!editingLink) return;
    try {
      await axios.put(`${API_URL}/link/${editingLink}`, {
        title: editTitle,
        url: editUrl,
      });
      setEditingLink(null);
      getData();
      Toast.show({
        type: "success",
        text1: "Link updated Successfully",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update failed",
      });
    }
  };

  const shareLink = async (link: Link) => {
    try {
      await Share.share({
        message: `Check out this link: (${link.title})\n${link.url}`,
      });
      Toast.show({
        type: "info",
        text1: "Link shared successfully",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Share failed",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Links</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {links.length === 0 ? (
          <Text style={styles.noLinksText}>No links are available.</Text>
        ) : (
          links.map((link) => (
            <View key={link._id} style={styles.cardWrapper}>
              {editingLink === link._id ? (
                <View style={styles.editCard}>
                  <TextInput
                    value={editTitle}
                    onChangeText={setEditTitle}
                    style={styles.input}
                    placeholder="Edit title"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    value={editUrl}
                    onChangeText={setEditUrl}
                    style={styles.input}
                    placeholder="Edit URL"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        color="#00F2C2"
                      />
                      <Text style={styles.btnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setEditingLink(null)}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={24}
                        color="#FF4D6D"
                      />
                      <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.card}>
                  <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => openLink(link.url)}
                  >
                    <Ionicons name="link-outline" size={28} color="#00F2C2" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardText}>{link.title}</Text>
                      <Text style={styles.dateText}>
                        {formatDate(link.createdAt)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => toggleLink(link._id)}>
                      <Ionicons
                        name={
                          visibleLinks[link._id]
                            ? "eye-outline"
                            : "eye-off-outline"
                        }
                        size={22}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => editLink(link)}>
                      <Ionicons
                        name="create-outline"
                        size={22}
                        color="#00F2C2"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteLink(link._id)}>
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#FF4D6D"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => shareLink(link)}>
                      <Ionicons
                        name="share-social-outline"
                        size={22}
                        color="#00BFFF"
                      />
                    </TouchableOpacity>
                  </View>

                  {visibleLinks[link._id] && (
                    <View style={styles.urlBox}>
                      <Text style={styles.urlText}>{link.url}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Toast provider */}
      <Toast position="bottom" bottomOffset={50} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0C3F",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  scrollContainer: { paddingBottom: 20 },
  cardWrapper: { marginBottom: 16 },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    shadowColor: "rgba(255,255,255,0.05)",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  cardText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  dateText: { color: "#9ca3af", fontSize: 14, marginTop: 2 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 6,
  },
  urlBox: {
    backgroundColor: "#10184e",
    borderColor: "#00F2C2",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  urlText: { color: "#00F2C2", fontSize: 15, textAlign: "center" },
  editCard: {
    borderColor: "#00F2C2",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  input: {
    color: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 16,
    borderColor: "#00F2C2",
    padding: 10,
    marginBottom: 10,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  cancelBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  btnText: { color: "#fff", fontSize: 14 },
  noLinksText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
  },
});