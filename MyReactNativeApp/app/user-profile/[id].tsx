import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/firebase";

export default function OtherUserProfile() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ username: string; avatarUrl?: string | null; email?: string | null } | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!id) return;
            try {
                const snap = await getDoc(doc(db, "profiles", id));
                if (cancelled) return;
                if (!snap.exists()) {
                    setUser(null);
                    return;
                }
                const data = snap.data() as { username?: string; avatarUrl?: string | null; email?: string | null };
                setUser({
                    username: data.username ?? "user",
                    avatarUrl: data.avatarUrl ?? null,
                    email: data.email ?? null,
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    function goBack() {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace("/(tabs)/search");
    }

    return (
        <View style={styles.page}>
            <Pressable onPress={goBack} style={styles.backBtn}>
                <Text style={styles.backText}>Back</Text>
            </Pressable>

            {loading ? (
                <Text style={styles.sub}>Loading...</Text>
            ) : user ? (
                <>
                    {user.avatarUrl ? (
                        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { alignItems: "center", justifyContent: "center" }]}>
                            <Text style={{ fontWeight: "900", opacity: 0.7 }}>?</Text>
                        </View>
                    )}
                    <Text style={styles.username}>@{user.username}</Text>
                    {user.email ? <Text style={styles.sub}>{user.email}</Text> : null}
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
