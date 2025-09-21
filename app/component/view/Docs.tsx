import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator, Alert, Dimensions, FlatList, Image, Modal, Share, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import Toast from "react-native-toast-message";

interface FileItem {
  _id: string;
  title: string;
  description: string;
  filePath: string;
  fileUrl: string;
  createdAt: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function FileListScreen() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFile, setNewFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [updating, setUpdating] = useState(false);

  const router = useRouter();
  const API_URL = "https://backend-1-60y9.onrender.com";

  const fetchFiles = async () => {
    try {
      Toast.show({
        type: "info",
        text1: "Loading Files...",
        autoHide: false,
      });
      const res = await axios.get<{ files: FileItem[] }>(`${API_URL}/files`);
      const email = await AsyncStorage.getItem("email");
      const response = await axios.post(`${API_URL}/findUser`, { email });
      const allFilesData = res.data.files;
      const filtered = allFilesData.filter(
        (fileData) => fileData.userId === response.data.user._id
      );
      setFiles(filtered);
      Toast.hide();
      Toast.show({ type: "success", text1: "Files fetched successfully" });
    } catch (err: unknown) {
      Toast.show({ type: "error", text1: "Failed to fetch Files" });
      console.log("Error fetching files:", (err as Error).message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleShare = async (fileUrl: string, title: string) => {
    try {
      await Share.share({ message: `${title}\n\n${fileUrl}` });
    } catch (err: unknown) {
      Toast.show({ type: "error", text1: "Failed to share file" });
      console.log("Error sharing file:", (err as Error).message);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const tempFile = `${FileSystem.cacheDirectory}${fileName}`;
      const downloadResult = await FileSystem.downloadAsync(fileUrl, tempFile);

      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Toast.show({
          type: "info",
          text1: "Permission required to save file",
        });
        return;
      }

      const fileUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          "application/octet-stream"
        );

      const base64Data = await FileSystem.readAsStringAsync(
        downloadResult.uri,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Toast.show({ type: "success", text1: "File saved in Downloads folder" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to download file" });
      console.log("Download error:", err);
    }
  };

  const handleDelete = (item: FileItem) => {
    Alert.alert("Delete", `Delete file: ${item.title}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/files/${item._id}`);
            setFiles(files.filter((f) => f._id !== item._id));
            Toast.show({
              type: "success",
              text1: "File deleted successfully",
            });
          } catch (err: unknown) {
            Toast.show({ type: "error", text1: "Failed to delete file" });
            console.log("Delete error:", (err as Error).message);
          }
        },
      },
    ]);
  };

  const handleUpdate = (item: FileItem) => {
    setSelectedFile(item);
    setNewTitle(item.title || "");
    setNewDesc(item.description || "");
    setNewFile(null);
    setUpdateModalVisible(true);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled) {
        setNewFile(result.assets[0]);
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to pick file" });
      console.log("File pick error:", err);
    }
  };

  const saveUpdate = async () => {
    if (!selectedFile) return;
    try {
      setUpdating(true); // start loading

      const formData = new FormData();
      formData.append("title", newTitle || "");
      formData.append("description", newDesc || "");

      if (newFile) {
        formData.append("file", {
          uri: newFile.uri,
          name: newFile.name,
          type: newFile.mimeType || "application/octet-stream",
        } as any);
      }

      await axios.put(`${API_URL}/files/${selectedFile._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUpdateModalVisible(false);
      fetchFiles();
      Toast.show({ type: "success", text1: "File updated successfully" });
    } catch (err: unknown) {
      Toast.show({ type: "error", text1: "Failed to update file" });
      console.log("Update error:", (err as Error).message);
    } finally {
      setUpdating(false); // stop loading
    }
  };

  const renderFileItem = ({ item }: { item: FileItem }) => {
    const fileUrl = item.fileUrl;

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);
    const isVideo = /\.(mp4|mov|avi)$/i.test(fileUrl.split("?")[0]);
    const isPDF = /\.pdf$/i.test(fileUrl.split("?")[0]);
    const isDoc =
      /\.(doc|docx|ppt|pptx|xls|xlsx|txt)$/i.test(fileUrl.split("?")[0]);

    const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      return new Date(dateString).toLocaleDateString("en-GB", options);
    };

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        {
          item.description &&
          <Text style={styles.desc}>{item.description}</Text>
        } 
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center",   
          marginBottom: 15
        }}>
          <Ionicons name="time-sharp" size={16} color="#bbb" 
            style={{ marginRight: 4 }} />
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        {isImage && <Image source={{ uri: fileUrl }} style={styles.filePreview} />}
        {isVideo && (
          <Video
            source={{ uri: fileUrl }}
            style={styles.filePreview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        )}
        {(isPDF || isDoc) && (
          <TouchableOpacity style={{ alignItems: "center", marginBottom: 12 }}>
            <Ionicons name="documents-outline" color="#fff" style={{ fontSize: 60 }} />
            <Text style={{ color: "#fff", marginTop: 6 }}>
              {isPDF ? "PDF File" : "Document File"}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => handleShare(fileUrl, item.title)}
            style={[styles.actionBtn, { backgroundColor: "#4CAF50" }]}
          >
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDownload(fileUrl, item.title)}
            style={[styles.actionBtn, { backgroundColor: "#2196F3" }]}
          >
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleUpdate(item)}
            style={[styles.actionBtn, { backgroundColor: "#FFC107" }]}
          >
            <Text style={styles.actionText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={[styles.actionBtn, { backgroundColor: "#F44336" }]}
          >
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.main}>
      {/* Header with Back Btn */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Files</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <FlatList
        data={files}
        keyExtractor={(item) => item._id}
        renderItem={renderFileItem}
        ListEmptyComponent={
          <Text style={styles.noDataText}>No files uploaded yet 📂</Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Update Modal */}
      <Modal visible={updateModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update File</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Enter title"
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="Enter description"
              multiline
              placeholderTextColor="#aaa"
            />
            {newFile ? (
              <>
                {/\.(jpg|jpeg|png|gif|webp)$/i.test(newFile.name) && (
                  <Image source={{ uri: newFile.uri }} style={styles.filePreview} />
                )}
                {/\.(mp4|mov|avi)$/i.test(newFile.name) && (
                  <Video
                    source={{ uri: newFile.uri }}
                    style={styles.filePreview}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                  />
                )}
                {/\.pdf$/i.test(newFile.name) && (
                  <Text style={{ color: "lime", marginBottom: 10 }}>
                    PDF Selected: {newFile.name}
                  </Text>
                )}
              </>
            ) : (
              <Text style={{ color: "#ccc", marginBottom: 10 }}>
                Current file will be kept unless you pick a new one.
              </Text>
            )}
            <TouchableOpacity style={styles.pickBtn} onPress={pickFile}>
              <Text style={styles.pickText}>Choose New File</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "gray", flex: 1, marginRight: 5 }]}
                onPress={() => setUpdateModalVisible(false)}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: updating ? "gray" : "green", flex: 1, marginLeft: 5 },
                ]}
                onPress={saveUpdate}
                disabled={updating} // disable while saving
              >
                <Text style={styles.actionText}>
                  {updating ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast position="bottom" bottomOffset={50} />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0a0c3f",
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  card: {
    backgroundColor: "#170134ff",
    padding: SCREEN_WIDTH * 0.04,
    borderWidth: 1,
    borderColor: "#00E0C7",
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: SCREEN_WIDTH < 350 ? 16 : 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#fff",
  },
  desc: {
    fontSize: SCREEN_WIDTH < 350 ? 14 : 15,
    color: "#fff",
    marginBottom: 8,
  },
  filePreview: {
    width: "100%",
    height: SCREEN_WIDTH * 0.5,
    borderRadius: 10,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  actionBtn: {
    margin: 4,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "600" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },
  noDataText: {
    fontSize: 16,
    color: "#ccc",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "#222", 
    padding: 20, borderRadius: 12, width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00E0C7",
    marginBottom: 15,
  },
  dateText: {
    fontSize: 14,
    color: "#bbb",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#00E0C7",
    padding: 10,
    borderRadius: 8,
    color: "#fff",
    marginBottom: 12,
  },
  pickBtn: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  pickText: { color: "#fff", fontWeight: "600" },
});
