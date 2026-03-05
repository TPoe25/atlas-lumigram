import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";

import { searchApiNinjas } from "../../src/workouts/apiNinjas";
import type { WorkoutResult } from "../../src/workouts/types";
import { WorkoutRow } from "../../app/workout/WorkoutRow";
import { usePosts } from "../../src/PostsContext";
import { FeedCard } from "../../src/FeedCard";

// Ensure USERS is exported from this file
export const USERS = [
    { id: 1, username: "user1", name: "User One" },
    { id: 2, username: "user2", name: "User Two" },
];

type Mode = "users" | "workouts" | "posts";

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

    // workouts
    const [workouts, setWorkouts] = useState<WorkoutResult[]>([]);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    // posts
    const { searchPosts, toggleFavorite, isFavorite } = usePosts();
    const [posts, setPosts] = useState<any[]>([]);
    const [postLoading, setPostLoading] = useState(false);

    const filteredUsers = useMemo(() => {
        const s = dq.trim().toLowerCase();
        if (!s) return USERS;
        return USERS.filter((u: any) => u.username?.toLowerCase().includes(s));
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
                setWorkouts(apiResults);
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

    useEffect(() => {
        if (mode !== "posts") return;

        const text = dq.trim();
        if (!text) {
            setPosts([]);
            return;
        }

        setPostLoading(true);
        (async () => {
            try {
                const res = await searchPosts(text);
                setPosts(res);
            } catch (e: any) {
                Alert.alert("Post search failed", e?.message ?? "Unknown error");
            } finally {
                setPostLoading(false);
            }
        })();
    }, [dq, mode, searchPosts]);

    return (
        <View style={styles.page}>
            <Text style={styles.h1}>Search</Text>

            <View style={styles.segmentRow}>
                <Pressable onPress={() => setMode("users")} style={[styles.segment, mode === "users" && styles.segmentActive]}>
                    <Text style={[styles.segmentText, mode === "users" && styles.segmentTextActive]}>Users</Text>
                </Pressable>

                <Pressable onPress={() => setMode("workouts")} style={[styles.segment, mode === "workouts" && styles.segmentActive]}>
                    <Text style={[styles.segmentText, mode === "workouts" && styles.segmentTextActive]}>Workouts</Text>
                </Pressable>

                <Pressable onPress={() => setMode("posts")} style={[styles.segment, mode === "posts" && styles.segmentActive]}>
                    <Text style={[styles.segmentText, mode === "posts" && styles.segmentTextActive]}>Posts</Text>
                </Pressable>
            </View>

            <TextInput
                value={q}
                onChangeText={setQ}
                placeholder={
                    mode === "users"
                        ? "Search usernames..."
                        : mode === "workouts"
                            ? "Search exercises (bench, curl, run)..."
                            : "Search post captions..."
                }
                style={styles.input}
                autoCapitalize="none"
            />

            {mode === "users" ? (
                <FlashList
                    data={filteredUsers}
                    keyExtractor={(u: any) => String(u.id)}
                    renderItem={({ item }: any) => (
                        <Pressable
                            onPress={() => router.push(`/user/${item.id}`)}
                            style={({ pressed }) => [styles.userRow, pressed && { opacity: 0.92 }]}
                        >
                            <Text style={{ fontWeight: "900" }}>{item.username}</Text>
                            <Text style={{ opacity: 0.7 }}>{item.name}</Text>
                        </Pressable>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
                    contentContainerStyle={{ paddingBottom: 16 }}
                />
            ) : mode === "workouts" ? (
                <FlashList
                    data={workouts}
                    keyExtractor={(w: any) => w.name + w.muscle + w.type}
                    renderItem={({ item }: any) => (
                        <WorkoutRow
                            w={item}
                            onPress={() =>
                                router.push({
                                    pathname: "/workout/[id]",
                                    params: {
                                        id: item.name,
                                        name: item.name,
                                        type: item.type,
                                        muscle: item.muscle,
                                        difficulty: item.difficulty,
                                        equipments: JSON.stringify(item.equipments ?? []),
                                        instructions: item.instructions ?? "",
                                        safety_info: item.safety_info ?? "",
                                    },
                                })
                            }
                        />
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>{loading ? "Searching…" : "Type to search workouts…"}</Text>}
                    contentContainerStyle={{ paddingBottom: 16 }}
                />
            ) : (
                <FlashList
                    data={posts}
                    keyExtractor={(p: any) => p.id}
                    renderItem={({ item }: any) => (
                        <FeedCard
                            imageUrl={item.imageUrl}
                            caption={item.caption ?? item.text ?? ""}
                            favorited={isFavorite(item.id)}
                            onDoubleTap={() => toggleFavorite(item.id)}
                        />
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>{postLoading ? "Searching…" : "Type to search posts…"}</Text>}
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
    segmentText: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
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
