import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import {
    deleteActivity,
    deleteAllActivitiesForUser,
    getActivitiesForUser,
    getUsers,
    initDb,
    type Activity,
} from "../../src/db";

function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString();
}

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const userId = useMemo(() => Number(id), [id]);

    const [logs, setLogs] = useState<Activity[]>([]);
    const [userName, setUserName] = useState("");
    const [q, setQ] = useState("");

    function refresh() {
        if (!Number.isFinite(userId)) return;
        initDb();
        const allUsers = getUsers();
        const user = allUsers.find((u) => u.id === userId);
        setUserName(user?.name ?? `User #${userId}`);
        setLogs(getActivitiesForUser(userId));
    }

    useEffect(() => {
        refresh();
    }, [userId]);

    const filtered = useMemo(() => {
        const t = q.trim();
        if (!t) return logs;
        const needle = t.toLowerCase();
        return logs.filter((a) => {
            const title = a.title.toLowerCase();
            const notes = (a.notes ?? "").toLowerCase();
            return title.includes(needle) || notes.includes(needle);
        });
    }, [q, logs]);

    function confirmDeleteAll() {
        Alert.alert("Delete all activities?", "This will remove all activities for this user.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete all",
                style: "destructive",
                onPress: () => {
                    deleteAllActivitiesForUser(userId);
                    refresh();
                },
            },
        ]);
    }

    function goBack() {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace("/(tabs)/home");
    }

    return (
        <View style={styles.page}>
            <View style={styles.headerRow}>
                <Pressable onPress={goBack} style={styles.backBtn}>
                    <Text style={{ fontWeight: "900" }}>Back</Text>
                </Pressable>

                <Text style={styles.h1}>{userName}</Text>
            </View>

            <View style={styles.actionsRow}>
                <Pressable
                    style={styles.primaryBtn}
                    onPress={() => router.push(`/user/${userId}/add-activity`)}
                >
                    <Text style={styles.primaryText}>Add Activity</Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={confirmDeleteAll}>
                    <Text style={styles.secondaryText}>Delete All</Text>
                </Pressable>
            </View>

            <Text style={styles.sub}>Activity logs</Text>

            <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search this user's activities..."
                autoCapitalize="none"
                style={styles.input}
            />

            <FlashList
                data={filtered}
                keyExtractor={(l) => String(l.id)}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.exercise}>{item.title}</Text>
                            <Text style={styles.meta}>
                                {item.kind === "strength"
                                    ? `${item.sets ?? 0} sets × ${item.reps ?? 0} reps${typeof item.weight === "number" ? ` • ${item.weight} lb` : ""}`
                                    : `${item.duration_minutes ?? 0} min${typeof item.distance_miles === "number" ? ` • ${item.distance_miles} mi` : ""}`}
                            </Text>
                            {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
                        </View>
                        <View style={styles.rightCol}>
                            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                            <Pressable
                                onPress={() => router.push(`/user/${userId}/edit-activity/${item.id}`)}
                                style={styles.miniBtn}
                            >
                                <Text style={styles.miniText}>Edit</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    deleteActivity(item.id);
                                    refresh();
                                }}
                                style={[styles.miniBtn, styles.miniDelete]}
                            >
                                <Text style={[styles.miniText, { color: "#B91C1C" }]}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>No activities yet.</Text>
                }
                contentContainerStyle={{ paddingBottom: 18 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#F3F4F6", paddingHorizontal: 16, paddingTop: 18 },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
    actionsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
    backBtn: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    h1: { fontSize: 22, fontWeight: "900", color: "#0F172A" },
    sub: { fontSize: 14, fontWeight: "800", color: "#0F172A", opacity: 0.8, marginBottom: 10 },
    primaryBtn: {
        flex: 1,
        backgroundColor: "#0F172A",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    primaryText: { color: "white", fontWeight: "900" },
    secondaryBtn: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 12,
        justifyContent: "center",
    },
    secondaryText: { fontWeight: "800", color: "#B91C1C" },

    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
    },

    row: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        gap: 12,
    },
    rightCol: { alignItems: "flex-end", gap: 8 },
    exercise: { fontWeight: "900", color: "#0F172A" },
    meta: { marginTop: 4, opacity: 0.75 },
    notes: { marginTop: 6, opacity: 0.8 },
    date: { opacity: 0.6, fontWeight: "800" },
    miniBtn: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    miniDelete: { borderColor: "#FECACA" },
    miniText: { fontWeight: "800", color: "#111827", fontSize: 12 },
    empty: { paddingVertical: 16, opacity: 0.7 },
});
