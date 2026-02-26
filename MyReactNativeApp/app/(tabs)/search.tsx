import { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Image } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { SEARCH_USERS } from "../../src/searchUsers";

// OPTIONAL: we’ll add workout search mode in section B
type Mode = "users" | "workouts";

export default function SearchTab() {
  const [mode, setMode] = useState<Mode>("users");
  const [q, setQ] = useState("");

  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return SEARCH_USERS;
    return SEARCH_USERS.filter((u) => u.username.toLowerCase().includes(s));
  }, [q]);

  return (
    <View style={styles.page}>
      <Text style={styles.h1}>Search</Text>

      {/* Toggle (users/workouts) — workouts part comes next */}
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
        placeholder={mode === "users" ? "Search usernames..." : "Search workouts..."}
        value={q}
        onChangeText={setQ}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {mode === "users" ? (
        <FlashList
          data={filteredUsers}
          keyExtractor={(u) => u.id}
          estimatedItemSize={72}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/user-profile/${item.id}`)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}
            >
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
              <Text style={styles.username}>@{item.username}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No matches.</Text>}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.empty}>
            Workouts search is next — keep reading below to wire the APIs.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F3F4F6", paddingHorizontal: 16, paddingTop: 18 },
  h1: { fontSize: 28, fontWeight: "900", color: "#0F172A", paddingBottom: 12 },

  segmentRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  segment: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
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
    fontSize: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 999, backgroundColor: "#E5E7EB" },
  username: { fontSize: 16, fontWeight: "900", color: "#0F172A" },

  emptyBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { opacity: 0.7, color: "#111827" },
});
