import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Image,
    Alert,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useProfile } from "../../src/ProfileContext";

export default function EditProfileScreen() {
    const { profile, updateProfile } = useProfile();

    const [username, setUsername] = useState(profile.username);
    const [avatarUri, setAvatarUri] = useState<string | null>(profile.avatarUri);

    async function pickAvatar() {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Permission needed", "Please allow access to your photo library.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.9,
            aspect: [1, 1],
        });

        if (result.canceled) return;
        setAvatarUri(result.assets[0].uri);
    }

    function save() {
        const u = username.trim();
        if (!u) {
            Alert.alert("Missing username", "Please enter a username.");
            return;
        }

        updateProfile({ username: u, avatarUri });
        Keyboard.dismiss();
        router.back();
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#F3F4F6" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
            <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
                <Text style={styles.h1}>Edit Profile</Text>

                <Pressable onPress={pickAvatar} style={styles.avatarBtn}>
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={{ fontWeight: "900", opacity: 0.7 }}>Add Photo</Text>
                        </View>
                    )}
                    <Text style={styles.avatarHint}>Tap to change photo</Text>
                </Pressable>

                <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username"
                    style={styles.input}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={save}
                />

                <Pressable style={styles.saveBtn} onPress={save}>
                    <Text style={styles.saveText}>Save</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: { padding: 16, paddingTop: 18, gap: 14 },
    h1: { fontSize: 28, fontWeight: "900", color: "#0F172A" },

    avatarBtn: { alignItems: "center", gap: 10, marginTop: 6 },
    avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#E5E7EB" },
    avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
    avatarHint: { fontWeight: "800", opacity: 0.75 },

    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },

    saveBtn: {
        backgroundColor: "#0F172A",
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
    },
    saveText: { color: "white", fontWeight: "900", fontSize: 16 },
});
