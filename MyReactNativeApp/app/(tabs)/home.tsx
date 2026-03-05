import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router, useFocusEffect } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";

import { FeedCard } from "../../src/FeedCard";
import { usePosts } from "../../src/PostsContext";
import { auth } from "../../src/firebase";
import { db } from "../../src/firebase";

import { initDb, getUsers, deleteUser, type User } from "../../src/db";
import { UserRow } from "../../src/UserRow";

type HomeItem =
  | { kind: "section"; id: "feed" | "tracker" }
  | { kind: "post"; id: string }
  | { kind: "user"; id: string };

export default function HomeTab() {
  // Posts feed (Lumigram)
  const {
    posts,
    toggleFavorite,
    isFavorite,
    refreshFeed,
    loadMorePosts,
    refreshingFeed,
    loadingMorePosts,
  } = usePosts();

  // Workout tracker (SQLite users)
  const [users, setUsers] = useState<User[]>([]);
  const [usernamesByUid, setUsernamesByUid] = useState<Record<string, string>>({});

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

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "profiles"),
      (snap) => {
        const map: Record<string, string> = {};
        snap.forEach((d) => {
          const data = d.data() as { username?: string };
          map[d.id] = data.username?.trim() || "user";
        });
        setUsernamesByUid(map);
      },
      () => {
        setUsernamesByUid({});
      }
    );
    return unsub;
  }, []);

  function formatCreatedAt(createdAt: any) {
    const date = createdAt?.toDate?.();
    if (!date || !(date instanceof Date)) return "";
    return date.toLocaleString();
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Unknown error");
    }
  }

  // Build a single list with sections + items
  const data: HomeItem[] = [
    { kind: "section", id: "tracker" },
    ...users.map((u): HomeItem => ({ kind: "user", id: String(u.id) })),
    { kind: "section", id: "feed" },
    ...posts.map((p): HomeItem => ({ kind: "post", id: p.id })),
  ];

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.h1}>Home</Text>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.addBtn} onPress={() => router.push("/add-user")}>
          <Text style={styles.addBtnText}>Add user</Text>
        </Pressable>
      </View>

      <FlashList
        data={data}
        keyExtractor={(item) => `${item.kind}:${item.id}`}
        contentContainerStyle={styles.listContent}
        onRefresh={refreshFeed}
        refreshing={refreshingFeed}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => {
          // Section headers
          if (item.kind === "section") {
            if (item.id === "tracker") {
              return <Text style={styles.h2}>Workout Tracker</Text>;
            }
            return <Text style={styles.h2}>All Posts</Text>;
          }

          // Posts feed items
          if (item.kind === "post") {
            const post = posts.find((p) => p.id === item.id);
            if (!post) return null;

            return (
              <FeedCard
                imageUrl={post.imageUrl}
                caption={post.caption ?? post.text ?? ""}
                authorName={usernamesByUid[post.uid || post.userId || ""] ?? "user"}
                timestampLabel={formatCreatedAt(post.createdAt)}
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
        ListFooterComponent={
          loadingMorePosts ? <Text style={styles.footer}>Loading more posts...</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F3F4F6" },
  listContent: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 6 },

  topBar: {
    paddingHorizontal: 16,
    paddingTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  h1: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
  },
  logoutBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: { fontWeight: "800", color: "#0F172A" },

  actionsRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 10,
  },
  h2: { fontSize: 18, fontWeight: "900", color: "#0F172A", marginTop: 8, marginBottom: 10 },

  addBtn: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: "white", fontWeight: "900" },

  empty: { paddingTop: 18, opacity: 0.7, color: "#111827" },
  footer: { textAlign: "center", opacity: 0.7, paddingVertical: 12 },
});
