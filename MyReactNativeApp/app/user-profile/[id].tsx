import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SEARCH_USERS } from "../../src/searchUsers";

export default function OtherUserProfile() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const user = SEARCH_USERS.find((u) => u.id === id);

    return (
        <View style={styles.page}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>Back</Text>
            </Pressable>

            {user ? (
                <>
                    <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                    <Text style={styles.username}>@{user.username}</Text>
                    <Text style={styles.sub}>This is a placeholder profile screen.</Text>
                </>
            ) : (
                <Text style={styles.sub}>User not found.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#F3F4F6", padding: 16, paddingTop: 24 },
    backBtn: { marginBottom: 16, alignSelf: "flex-start" },
    backText: { fontWeight: "900", opacity: 0.8 },
    avatar: { width: 96, height: 96, borderRadius: 999, backgroundColor: "#E5E7EB" },
    username: { marginTop: 12, fontSize: 24, fontWeight: "900", color: "#0F172A" },
    sub: { marginTop: 8, opacity: 0.7, color: "#111827" },
});
