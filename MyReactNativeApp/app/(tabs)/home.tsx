import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router, useFocusEffect } from "expo-router";

import { FeedCard } from "../../src/FeedCard";
import { usePosts } from "../../src/PostsContext";

import { initDb, getUsers, deleteUser, type User } from "../../src/db";
import { UserRow } from "../../src/UserRow";

type HomeItem =
  | { kind: "section"; id: "feed" | "tracker" }
  | { kind: "post"; id: string }
  | { kind: "user"; id: string };

export default function HomeTab() {
  // Posts feed (Lumigram)
  const { posts, toggleFavorite, isFavorite } = usePosts();

  // Workout tracker (SQLite users)
  const [users, setUsers] = useState<User[]>([]);

  function refreshUsers() {
    setUsers(getUsers());
  }

  useEffect(() => {
    initDb();
    refreshUsers();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refreshUsers();
    }, [])
  );

  // Build a single list with sections + items
  const data: HomeItem[] = [
    { kind: "section", id: "feed" },
    ...posts.map((p) => ({ kind: "post", id: p.id })),
    { kind: "section", id: "tracker" },
    ...users.map((u) => ({ kind: "user", id: String(u.id) })),
  ];

  return (
    <View style={styles.page}>
      <FlashList
        data={data}
        keyExtractor={(item) => `${item.kind}:${item.id}`}
        estimatedItemSize={320}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          // Section headers
          if (item.kind === "section") {
            if (item.id === "feed") {
              return <Text style={styles.h1}>Home</Text>;
            }
            return (
              <View style={styles.trackerHeader}>
                <Text style={styles.h2}>Workout Tracker</Text>

                <Pressable
                  style={styles.addBtn}
                  onPress={() => router.push("/add-user")}
                >
                  <Text style={styles.addBtnText}>Add user</Text>
                </Pressable>
              </View>
            );
          }

          // Posts feed items
          if (item.kind === "post") {
            const post = posts.find((p) => p.id === item.id);
            if (!post) return null;

            return (
              <FeedCard
                imageUrl={post.imageUrl}
                caption={post.caption}
                favorited={isFavorite(post.id)}
                onDoubleTap={() => toggleFavorite(post.id)}
              />
            );
          }

          // User items
          const user = users.find((u) => String(u.id) === item.id);
          if (!user) return null;

          return (
            <UserRow
              user={user}
              onPress={() => router.push(`/user/${user.id}`)}
              onDelete={() => {
                deleteUser(user.id);
                refreshUsers();
              }}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Nothing to show yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F3F4F6" },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },

  h1: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    paddingTop: 18,
    paddingBottom: 12,
  },

  trackerHeader: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  h2: { fontSize: 18, fontWeight: "900", color: "#0F172A" },

  addBtn: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: "white", fontWeight: "900" },

  empty: { paddingTop: 18, opacity: 0.7, color: "#111827" },
});
