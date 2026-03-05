import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { FlashList } from "@shopify/flash-list";

import type { WorkoutLog } from "../../src/workouts/logTypes";
import { getWorkoutLogsForUser, searchWorkoutLogsForUser } from "../../src/workouts/logs";

function formatDate(ts: any) {
    // ts can be Firestore Timestamp or undefined
    try {
        const d = ts?.toDate?.() ?? new Date();
        return d.toLocaleDateString();
    } catch {
        return "";
    }
}

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const uid = String(id);

    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);

    async function loadLatest() {
        setLoading(true);
        try {
            const res = await getWorkoutLogsForUser(uid, 50);
            setLogs(res);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadLatest();
    }, [uid]);

    useEffect(() => {
        const t = q.trim();
        if (!t) {
            loadLatest();
            return;
        }

        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await searchWorkoutLogsForUser(uid, t, 25);
                if (!cancelled) setLogs(res);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [q, uid]);

    return (
        <View style={styles.page}>
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={{ fontWeight: "900" }}>Back</Text>
                </Pressable>

                <Text style={styles.h1}>User Profile</Text>
            </View>

            <Text style={styles.sub}>Workout logs</Text>

            <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search this user's logs (e.g. bench, curl)..."
                autoCapitalize="none"
                style={styles.input}
            />

            <FlashList
                data={logs}
                keyExtractor={(l) => l.id}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.exercise}>{item.exerciseName}</Text>
                            <Text style={styles.meta}>
                                {item.sets} sets × {item.reps} reps
                                {typeof item.weight === "number" ? ` • ${item.weight} lb` : ""}
                            </Text>
                            {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
                        </View>
                        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        {loading ? "Loading…" : "No workout logs yet."}
                    </Text>
                }
                contentContainerStyle={{ paddingBottom: 18 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#F3F4F6", paddingHorizontal: 16, paddingTop: 18 },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
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
    exercise: { fontWeight: "900", color: "#0F172A" },
    meta: { marginTop: 4, opacity: 0.75 },
    notes: { marginTop: 6, opacity: 0.8 },
    date: { opacity: 0.6, fontWeight: "800" },
    empty: { paddingVertical: 16, opacity: 0.7 },
});
