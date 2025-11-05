import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, // 👈 added for loader
} from "react-native";
import Toast from "react-native-toast-message"; // ✅ Toast

type Cred = {
  _id: string;
  site: string;
  username: string;
  userEmail: string;
  password: string;
  createdAt?: string | number;
};

export default function CredentialsScreen() {
  const [creds, setCreds] = useState<Cred[]>([]);
  const [loading, setLoading] = useState(true); // 👈 loader state
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [editingCred, setEditingCred] = useState<string | null>(null);
  const [editSite, setEditSite] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const API_URL = "https://backend-1-60y9.onrender.com";

  const getData = async () => {
    try {
      setLoading(true); // 👈 start loader
      Toast.show({
        type: "info",
        text1: "Loading Credentials...",
        autoHide: false,
      });

      const res = await axios.get<{ cred: Cred[] }>(`${API_URL}/creds`);
      const email = await AsyncStorage.getItem("email");
      const user = await axios.post(`${API_URL}/findUser`, { email });

      const CredsData = res.data.cred;
      const matched = CredsData.filter((cred) => cred.userId === user.data.user._id);

      setCreds(matched || []);
      Toast.hide();
      Toast.show({ type: "success", text1: "Credentials loaded successfully" });
    } catch (error) {
      console.log(error);
      Toast.show({ type: "error", text1: "Error fetching credentials" });
    } finally {
      setLoading(false); // 👈 stop loader
      Toast.hide();
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const shareCred = (cred: Cred) => {
    Share.share({
      message: `App: ${cred.site}\nUsername: ${cred.username}\nEmail: ${cred.userEmail}\nPassword: ${cred.password}`,
    })
      .then(() => {
        Toast.show({ type: "success", text1: "Credential shared" });
      })
      .catch(() => {
        Toast.show({ type: "error", text1: "Failed to share credential" });
      });
  };

  const deleteCred = (id: string) => {
    Alert.alert("Delete Credential", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/creds/${id}`);
            getData();
            Toast.show({ type: "success", text1: "Credential deleted" });
          } catch (error) {
            Toast.show({ type: "error", text1: "Failed to delete credential" });
          }
        },
      },
    ]);
  };

  const editCred = (cred: Cred) => {
    setEditingCred(cred._id);
    setEditSite(cred.site);
    setEditUsername(cred.username);
    setEditEmail(cred.userEmail);
    setEditPassword(cred.password);
  };

  const saveEdit = async () => {
    if (!editingCred) return;
    try {
      await axios.put(`${API_URL}/creds/${editingCred}`, {
        site: editSite,
        username: editUsername,
        userEmail: editEmail,
        password: editPassword,
      });
      setEditingCred(null);
      getData();
      Toast.show({ type: "success", text1: "Credential updated" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to update credential" });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Credentials</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* ✅ Loader added here */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00F2C2" />
          <Text style={styles.loadingText}>Loading Credentials...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {creds.length === 0 ? (
            <Text style={{ color: "#aaa", textAlign: "center", marginTop: 30 }}>
              No credentials added yet.
            </Text>
          ) : (
            creds.map((cred) => (
              <View key={cred._id} style={styles.card}>
                {editingCred === cred._id ? (
                  <View>
                    {/* Editing Inputs */}
                    <TextInput
                      value={editSite}
                      onChangeText={setEditSite}
                      placeholder="App / Site"
                      placeholderTextColor="#999"
                      style={styles.input}
                    />
                    <TextInput
                      value={editUsername}
                      onChangeText={setEditUsername}
                      placeholder="Username"
                      placeholderTextColor="#999"
                      style={styles.input}
                    />
                    <TextInput
                      value={editEmail}
                      onChangeText={setEditEmail}
                      placeholder="Email"
                      placeholderTextColor="#999"
                      style={styles.input}
                    />

                    {/* Password Input with toggle */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderColor: "#00F2C2",
                        borderWidth: 1,
                        borderRadius: 6,
                      }}
                    >
                      <TextInput
                        value={editPassword}
                        onChangeText={setEditPassword}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!visiblePasswords[cred._id]}
                        style={{ flex: 1, padding: 10, color: "#fff", fontSize: 16 }}
                      />
                      <TouchableOpacity
                        onPress={() => togglePassword(cred._id)}
                        style={{ padding: 8 }}
                      >
                        <Ionicons
                          name={
                            visiblePasswords[cred._id] ? "eye-outline" : "eye-off-outline"
                          }
                          size={22}
                          color="#00F2C2"
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={saveEdit}>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="#00F2C2"
                        />
                        <Text style={[styles.actionText, { color: "#00F2C2" }]}>
                          Save
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => setEditingCred(null)}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={20}
                          color="#ff4d4d"
                        />
                        <Text style={[styles.actionText, { color: "#ff4d4d" }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.cardTop}>
                      <Ionicons name="person-circle-outline" size={34} color="#00F2C2" />
                      <Text style={styles.appTitle}>{cred.site}</Text>
                    </View>

                    {/* ✅ Created Time Row */}
                    <View style={styles.timeRow}>
                      <Ionicons
                        name="time-sharp"
                        size={14}
                        color="#bbb"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.dateText}>
                        {cred.createdAt
                          ? new Date(Number(cred.createdAt)).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.label}>Username:</Text>
                      <Text style={styles.value}>{cred.username}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.label}>Email:</Text>
                      <Text style={styles.value}>{cred.userEmail}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.label}>Password:</Text>
                      <TouchableOpacity onPress={() => togglePassword(cred._id)}>
                        <Ionicons
                          name={
                            visiblePasswords[cred._id]
                              ? "eye-outline"
                              : "eye-off-outline"
                          }
                          size={20}
                          color="#00F2C2"
                          style={{ marginRight: 8 }}
                        />
                      </TouchableOpacity>
                      <Text style={styles.value}>
                        {visiblePasswords[cred._id] ? cred.password : "••••••••"}
                      </Text>
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => editCred(cred)}
                      >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => shareCred(cred)}
                      >
                        <Ionicons name="share-social-outline" size={20} color="#00F2C2" />
                        <Text
                          style={[styles.actionText, { color: "#00F2C2" }]}
                        >
                          Share
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => deleteCred(cred._id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
                        <Text
                          style={[styles.actionText, { color: "#ff4d4d" }]}
                        >
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Toast Component */}
      <Toast position="bottom" bottomOffset={60} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0C3F", paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 25 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#00F2C2", fontSize: 16, fontWeight: "600", marginTop: 10 },
  scrollContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  appTitle: { color: "#fff", fontSize: 20, fontWeight: "600", marginLeft: 10 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  label: { color: "#aaa", fontSize: 15, width: 90 },
  value: { color: "#fff", fontSize: 16, flexShrink: 1 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { fontSize: 14, color: "#fff" },
  input: {
    backgroundColor: "#1c1a48",
    color: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#00F2C2",
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  timeRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  dateText: {
    fontSize: 13,
    color: "#bbb",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
