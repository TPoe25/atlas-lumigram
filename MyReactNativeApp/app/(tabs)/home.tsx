import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router, useFocusEffect } from "expo-router";

import { initDb, getUsers, deleteUser, User } from "../../src/db";
import { UserRow } from "../../src/UserRow";

export default function UsersHome() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    initDb();
    setUsers(getUsers());
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setUsers(getUsers());
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Workout Tracker</Text>

      <Pressable
        style={styles.primaryBtn}
        onPress={() => router.push("/add-user")}
      >
        <Text style={styles.primaryText}>Add user</Text>
      </Pressable>

      <View style={{ flex: 1, marginTop: 14 }}>
        <FlashList
          data={users}
          keyExtractor={(u) => String(u.id)}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              onPress={() => router.push(`/user/${item.id}`)}
              onDelete={() => {
                deleteUser(item.id);
                setUsers(getUsers());
              }}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No users yet. Add your first athlete 👇
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#F3F4F6",
  },
  h1: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 14,
    color: "#111827",
  },
  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  primaryText: { color: "white", fontWeight: "900" },
  empty: { marginTop: 18, opacity: 0.7, color: "#111827" },
});
