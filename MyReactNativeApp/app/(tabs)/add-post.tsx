import { useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { usePosts } from "../../src/PostsContext";

export default function AddPostTab() {
  const { addPost } = usePosts();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (result.canceled) return;

    setImageUri(result.assets[0].uri);
  }

  function handleAddPost() {
    if (!imageUri) {
      Alert.alert("Missing image", "Pick an image first.");
      return;
    }

    addPost({
      imageUrl: imageUri, // local URI is fine for now (later: Firebase Storage)
      caption: caption.trim(),
    });

    // reset form
    setImageUri(null);
    setCaption("");
    Alert.alert("Posted!", "Your post was added.");
  }

  return (
    <View style={styles.page}>
      <Text style={styles.h1}>Add Post</Text>

      <Pressable style={styles.pickBtn} onPress={pickImage}>
        <Text style={styles.pickText}>{imageUri ? "Change Image" : "Select Image"}</Text>
      </Pressable>

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
      />

      <Pressable style={styles.postBtn} onPress={handleAddPost}>
        <Text style={styles.postText}>Add Post</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, paddingTop: 18, backgroundColor: "#F3F4F6", gap: 14 },
  h1: { fontSize: 28, fontWeight: "900", color: "#0F172A" },

  pickBtn: {
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
