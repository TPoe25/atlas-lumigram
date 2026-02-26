import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";

// workouts
import { EXERCISE_DB } from "../../src/workouts/exerciseDb";
import { searchApiNinjas } from "../../src/workouts/apiNinjas";
import { attachGifUrls } from "../../src/workouts/attachGifs";
import type { WorkoutResult } from "../../src/workouts/types";
import { WorkoutRow } from "../../app/workout/WorkoutRow"; // Update the path to the correct location

// users placeholder
import { SEARCH_USERS } from "../../src/searchUsers";

type Mode = "users" | "workouts";

function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(t);
    }, [value, delayMs]);
    return debounced;
}

export default function SearchTab() {
    const [mode, setMode] = useState<Mode>("users");
    const [q, setQ] = useState("");
    const dq = useDebouncedValue(q, 250);

    const [workouts, setWorkouts] = useState<WorkoutResult[]>([]);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const filteredUsers = useMemo(() => {
        const s = dq.trim().toLowerCase();
        if (!s) return SEARCH_USERS;
        return SEARCH_USERS.filter((u) => u.username?.toLowerCase().includes(s));
    }, [dq]);

    useEffect(() => {
        if (mode !== "workouts") return;

        const name = dq.trim();
        if (!name) {
            setWorkouts([]);
            return;
        }

        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        setLoading(true);

        (async () => {
            try {
                const apiResults = await searchApiNinjas({ name }, ac.signal);
                if (ac.signal.aborted) return;

                const withGifs = attachGifUrls(apiResults, EXERCISE_DB);
                setWorkouts(withGifs);
            } catch (e: any) {
                if (ac.signal.aborted) return;
                Alert.alert("Workout search failed", e?.message ?? "Unknown error");
                setWorkouts([]);
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [dq, mode]);

    return (
        <View style={styles.page}>
            <Text style={styles.h1}>Search</Text>

            <View style={styles.segmentRow}>
                <Pressable
                    onPress={() => setMode("users")}
                    style={[styles.segment, mode === "users" && styles.segmentActive]}
                >
                    <Text style={[styles.segmentText, mode === "users" && styles.segmentTextActive]}>
                        Users
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => setMode("workouts")}
                    style={[styles.segment, mode === "workouts" && styles.segmentActive]}
                >
                    <Text style={[styles.segmentText, mode === "workouts" && styles.segmentTextActive]}>
                        Workouts
                    </Text>
                </Pressable>
            </View>

            <TextInput
                value={q}
                onChangeText={setQ}
                placeholder={
                    mode === "users"
                        ? "Search usernames..."
                        : "Search exercises (bench, curl, run)..."
                }
                style={styles.input}
                autoCapitalize="none"
            />

            {mode === "users" ? (
                <FlashList
                    data={filteredUsers}
                    keyExtractor={(u) => String(u.id)}
                    estimatedItemSize={72}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => router.push(`/user-profile/${item.id}`)}
                            style={({ pressed }) => [styles.userRow, pressed && { opacity: 0.92 }]}
                        >
                            <Text style={{ fontWeight: "900" }}>@{item.username}</Text>
                        </Pressable>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
                    contentContainerStyle={{ paddingBottom: 16 }}
                />
            ) : (
                <FlashList
                    data={workouts}
                    keyExtractor={(w) => w.id}
                    estimatedItemSize={86}
                    renderItem={({ item }) => (
                        <WorkoutRow
                            w={item}
                            onPress={() =>
                                router.push({
                                    pathname: "/workout/[id]", // ✅ correct for app/workout/[id].tsx
                                    params: {
                                        id: item.id,
                                        name: item.name,
                                        type: item.type,
                                        muscle: item.muscle,
                                        difficulty: item.difficulty,
                                        equipments: JSON.stringify(item.equipments ?? []),
                                        instructions: item.instructions ?? "",
                                        safety_info: item.safety_info ?? "",
                                        gifUrl: item.gifUrl ?? "",
                                    },
                                })
                            }
                        />
                    )}
                    ListEmptyComponent={
                        <Text style={styles.empty}>
                            {loading ? "Searching…" : "Type to search workouts…"}
                        </Text>
                    }
                    contentContainerStyle={{ paddingBottom: 16 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#F3F4F6", paddingHorizontal: 16, paddingTop: 18 },
    h1: { fontSize: 28, fontWeight: "900", color: "#0F172A", marginBottom: 10 },

    segmentRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
    segment: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 14,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignItems: "center",
    },
    segmentActive: { backgroundColor: "#0F172A", borderColor: "#0F172A" },
    segmentText: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
    segmentTextActive: { color: "white" },

    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
    },

    userRow: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
    },

    empty: { paddingVertical: 16, opacity: 0.7 },
});
