import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { usePosts } from "../../src/PostsContext";

export default function AddPostTab() {
  const { addPost } = usePosts();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // safe + compatible
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleAddPost() {
    if (!imageUri) {
      Alert.alert("Missing image", "Pick an image first.");
      return;
    }

    try {
      setLoading(true);
      await addPost({ imageUri, caption });
      setImageUri(null);
      setCaption("");
      Keyboard.dismiss();
      Alert.alert("Posted!", "Your post was added.");
    } catch (e: any) {
      Alert.alert("Post failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#F3F4F6" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Add Post</Text>

          <View style={styles.btnRow}>
            <Pressable style={styles.pickBtn} onPress={pickFromLibrary} disabled={loading}>
              <Text style={styles.pickText}>Library</Text>
            </Pressable>

            <Pressable style={styles.pickBtn} onPress={takePhoto} disabled={loading}>
              <Text style={styles.pickText}>Camera</Text>
            </Pressable>
          </View>

          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={{ opacity: 0.6 }}>No image selected</Text>
            </View>
          )}

          <TextInput
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            style={styles.input}
            multiline
            blurOnSubmit
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          <Pressable style={styles.postBtn} onPress={handleAddPost} disabled={loading}>
            <Text style={styles.postText}>{loading ? "Uploading..." : "Add Post"}</Text>
          </Pressable>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 16, paddingTop: 18, backgroundColor: "#F3F4F6", gap: 14 },
  h1: { fontSize: 28, fontWeight: "900", color: "#0F172A" },

  btnRow: { flexDirection: "row", gap: 12 },
  pickBtn: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  pickText: { fontWeight: "900", color: "#0F172A" },

  preview: { width: "100%", height: 320, borderRadius: 18, backgroundColor: "#E5E7EB" },
  previewPlaceholder: {
    width: "100%",
    height: 320,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 90,
    textAlignVertical: "top",
  },

  postBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  postText: { color: "white", fontWeight: "900", fontSize: 16 },
});
