import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from "expo-blur"; // ✅ blur effect
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, SafeAreaView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

interface Note {
  _id: string;
  title: string;
  note: string;
  userId: string;
  createdAt?: string | number;
}

export default function NotesScreen() {
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [revealed, setRevealed] = useState<{ [key: string]: boolean }>({}); // ✅ track per-note visibility
  const API_URL = "https://backend-1-60y9.onrender.com";

  const getData = async () => {
    try {
      Toast.show({
        type: "info",
        text1: "Loading Notes...",
        autoHide: false,
      });
      const email = await AsyncStorage.getItem("email");
      const response = await axios.post(`${API_URL}/findUser`, { email });

      const res = await axios.get(`${API_URL}/note`);
      const notesData: Note[] = res.data.note;

      const matched = notesData.filter(
        (note) => note.userId === response.data.user._id
      );

      setNotes(matched);
      Toast.hide();
      if (matched.length > 0) {
        Toast.show({ type: "success", text1: "Notes loaded successfully" });
      } else {
        Toast.show({ type: "info", text1: "No notes found" });
      }
    } catch (error) {
      console.log(error);
      Toast.show({ type: "error", text1: "Failed to fetch notes" });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const onShare = async (note: Note) => {
    try {
      await Share.share({
        message: `${note.title}\n${note.note}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (timestamp?: string | number) => {
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

  const remove = (id: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/note/${id}`);
            setNotes((prev) => prev.filter((note) => note._id !== id));
            setRevealed((prev) => {
              const copy = { ...prev };
              delete copy[id];
              return copy;
            });

            Toast.show({
              type: "success",
              text1: "Note deleted successfully",
            });

            getData(); // refresh list
          } catch (error) {
            console.log(error);
            Toast.show({
              type: "error",
              text1: "Failed to delete note",
            });
          }
        },
      },
    ]);
  };

  const startEditing = (note: Note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.note);
  };

  const saveEdit = async (id: string) => {
    try {
      await axios.put(`${API_URL}/note/${id}`, {
        title: editTitle,
        note: editContent,
      });

      setNotes((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, title: editTitle, note: editContent } : n
        )
      );
      setEditingId(null);
      setEditTitle("");
      setEditContent("");
      Toast.show({ type: "success", text1: "Note updated successfully" });
      getData();
    } catch (error) {
      console.log(error);
      Toast.show({ type: "error", text1: "Failed to update note" });
    }
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      {editingId === item._id ? (
        <>
          <TextInput
            style={styles.editInput}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Edit title"
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={[styles.editInput, { height: 80 }]}
            value={editContent}
            onChangeText={setEditContent}
            placeholder="Edit note"
            placeholderTextColor="#9ca3af"
            multiline
          />
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => saveEdit(item._id)}
            >
              <Ionicons name="checkmark-done" size={20} color="#00f2c2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setEditingId(null)}
            >
              <Ionicons name="close" size={20} color="#fc4444ff" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.noteTitle}>{item.title}</Text>

          {/* ✅ BlurView Toggle Section */}
          <View style={{ position: "relative", marginBottom: 10 }}>
            {revealed[item._id] ? (
              // 👉 When revealed: show real content with natural height
              <Text style={styles.noteContent}>{item.note}</Text>
            ) : (
              // 👉 When hidden: force minHeight for consistent look
              <View style={styles.hiddenBox}>
                <BlurView
                  intensity={60}
                  tint="dark"
                  style={StyleSheet.absoluteFillObject}
                >
                  <View style={styles.placeholderBox}>
                    <Text style={styles.placeholderText}>••••••••••••••••••••</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setRevealed((prev) => ({ ...prev, [item._id]: true }))
                      }
                      style={styles.revealBtn}
                    >
                      <Text style={styles.revealText}>🔒 Tap to Reveal</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            )}

            {revealed[item._id] && (
              <TouchableOpacity
                onPress={() =>
                  setRevealed((prev) => ({ ...prev, [item._id]: false }))
                }
                style={styles.hideBtn}
              >
                <Text style={styles.hideText}>🙈 Hide Again</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flexDirection: "row" }}>
            <Ionicons name="time-sharp" size={18} color="#fff" />
            <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => startEditing(item)}
            >
              <Ionicons name="create-outline" size={20} color="#00f2c2" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => remove(item._id)}
              style={styles.actionBtn}
            >
              <Ionicons name="trash" size={20} color="#fc4444ff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onShare(item)}
            >
              <Ionicons
                name="share-social-outline"
                size={20}
                color="#0088ff"
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Notes</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Notes List */}
      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notes available</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          renderItem={renderNote}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Toast position="bottom" bottomOffset={50} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0c3f", padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  noteCard: {
    backgroundColor: "#1c1a48",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#00f2c2",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  noteTitle: { fontSize: 19, fontWeight: "600", marginBottom: 6, color: "#00f2c2" },
  noteContent: { fontSize: 17, color: "#d1d5db" },
  noteDate: { fontSize: 15, color: "#9ca3af", marginBottom: 10, marginLeft: 5 },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  actionBtn: { padding: 6, borderRadius: 8, backgroundColor: "#0a0c3f" },
  editInput: {
    backgroundColor: "#0a0c3f",
    borderColor: "#00f2c2",borderWidth: 1,borderRadius: 8,padding: 8,
    marginBottom: 10,
    color: "#fff",
    fontSize: 15,
  },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#d1d5db", fontSize: 16, fontWeight: "500" },
  revealBtn: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  revealText: { color: "#00f2c2", fontWeight: "700", fontSize: 15 },
  hideBtn: { marginTop: 6, alignSelf: "flex-end" },
  hiddenBox: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  placeholderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#ccc",
    fontSize: 16,
    letterSpacing: 3,
    marginBottom: 10,
  },

  hideText: { color: "#ffcc00", fontWeight: "600", fontSize: 14 },
});