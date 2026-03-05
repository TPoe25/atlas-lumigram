import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../../src/firebase";
import { FeedCard } from "../../src/FeedCard";
import { getWorkoutLogsForUser } from "../../src/workouts/logs";
import type { WorkoutLog } from "../../src/workouts/logTypes";

type ProfilePost = {
    id: string;
    imageUrl: string;
    caption: string;
    createdAt?: any;
};

function formatTimestamp(ts: any) {
    const date = ts?.toDate?.();
    if (!date || !(date instanceof Date)) return "";
    return date.toLocaleString();
}

function toMillis(ts: any) {
    const date = ts?.toDate?.();
    if (!date || !(date instanceof Date)) return 0;
    return date.getTime();
}

export default function OtherUserProfile() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ username: string; avatarUrl?: string | null; email?: string | null } | null>(null);
    const [posts, setPosts] = useState<ProfilePost[]>([]);
    const [activityLogs, setActivityLogs] = useState<WorkoutLog[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!id) {
                if (!cancelled) setLoading(false);
                return;
            }
            try {
                const snap = await getDoc(doc(db, "profiles", id));
                if (cancelled) return;
                if (!snap.exists()) {
                    setUser(null);
                } else {
                    const data = snap.data() as { username?: string; avatarUrl?: string | null; email?: string | null };
                    setUser({
                        username: data.username ?? "user",
                        avatarUrl: data.avatarUrl ?? null,
                        email: data.email ?? null,
                    });
                }

                const postsByUidSnap = await getDocs(
                    query(collection(db, "posts"), where("uid", "==", id), limit(50))
                );
                let nextPosts = postsByUidSnap.docs.map((d) => {
                    const data = d.data() as {
                        imageUrl?: string;
                        caption?: string;
                        text?: string;
                        createdAt?: any;
                    };
                    return {
                        id: d.id,
                        imageUrl: data.imageUrl ?? "",
                        caption: data.caption ?? data.text ?? "",
                        createdAt: data.createdAt,
                    };
                });

                if (nextPosts.length === 0) {
                    const postsByUserIdSnap = await getDocs(
                        query(collection(db, "posts"), where("userId", "==", id), limit(50))
                    );
                    nextPosts = postsByUserIdSnap.docs.map((d) => {
                        const data = d.data() as {
                            imageUrl?: string;
                            caption?: string;
                            text?: string;
                            createdAt?: any;
                        };
                        return {
                            id: d.id,
                            imageUrl: data.imageUrl ?? "",
                            caption: data.caption ?? data.text ?? "",
                            createdAt: data.createdAt,
                        };
                    });
                }
                nextPosts.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

                const logs = await getWorkoutLogsForUser(id, 50);

                if (!cancelled) {
                    setPosts(nextPosts);
                    setActivityLogs(logs);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    function goBackToSearch() {
        router.replace("/(tabs)/search");
    }

    return (
        <View style={styles.page}>
            <Pressable onPress={goBackToSearch} style={styles.backBtn}>
                <Text style={styles.backText}>Back</Text>
            </Pressable>

            {loading ? (
                <Text style={styles.sub}>Loading...</Text>
            ) : user ? (
                <ScrollView contentContainerStyle={styles.content}>
                    {user.avatarUrl ? (
                        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { alignItems: "center", justifyContent: "center" }]}>
                            <Text style={{ fontWeight: "900", opacity: 0.7 }}>?</Text>
                        </View>
                    )}
                    <Text style={styles.username}>@{user.username}</Text>
                    {user.email ? <Text style={styles.sub}>{user.email}</Text> : null}

                    <Text style={styles.sectionTitle}>Posts</Text>
                    {posts.length ? (
                        posts.map((p) => (
                            <FeedCard
                                key={p.id}
                                imageUrl={p.imageUrl}
                                caption={p.caption}
                                authorName={user.username}
                                timestampLabel={formatTimestamp(p.createdAt)}
                            />
                        ))
                    ) : (
                        <Text style={styles.empty}>No posts yet.</Text>
                    )}

                    <Text style={styles.sectionTitle}>Activity Log</Text>
                    {activityLogs.length ? (
                        activityLogs.map((log) => (
                            <View key={log.id} style={styles.logRow}>
                                <Text style={styles.logTitle}>{log.exerciseName}</Text>
                                <Text style={styles.logMeta}>
                                    {log.sets} sets x {log.reps} reps
                                    {typeof log.weight === "number" ? ` • ${log.weight} lb` : ""}
                                </Text>
                                {log.notes ? <Text style={styles.logNotes}>{log.notes}</Text> : null}
                                <Text style={styles.logDate}>{formatTimestamp(log.createdAt)}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.empty}>No activity logged yet.</Text>
                    )}

                    <Pressable onPress={goBackToSearch} style={styles.bottomBackBtn}>
                        <Text style={styles.bottomBackText}>Go back to search</Text>
                    </Pressable>
                </ScrollView>
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
    content: { paddingBottom: 18 },
    avatar: { width: 96, height: 96, borderRadius: 999, backgroundColor: "#E5E7EB" },
    username: { marginTop: 12, fontSize: 24, fontWeight: "900", color: "#0F172A" },
    sub: { marginTop: 8, opacity: 0.7, color: "#111827" },
    sectionTitle: {
        marginTop: 18,
        marginBottom: 10,
        fontSize: 18,
        fontWeight: "900",
        color: "#0F172A",
    },
    empty: { marginBottom: 10, opacity: 0.7, color: "#111827" },
    logRow: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
    },
    logTitle: { fontWeight: "900", color: "#0F172A" },
    logMeta: { marginTop: 4, opacity: 0.8, color: "#111827" },
    logNotes: { marginTop: 6, color: "#111827", opacity: 0.85 },
    logDate: { marginTop: 8, opacity: 0.6, fontWeight: "700", color: "#111827", fontSize: 12 },
    bottomBackBtn: {
        marginTop: 8,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    bottomBackText: { fontWeight: "900", color: "#0F172A" },
});
