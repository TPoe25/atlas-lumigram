import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import type { User } from "./db.native";

export function UserRow({
  user,
  onPress,
  onDelete,
}: {
  user: User;
  onPress: () => void;
  onDelete: () => void;
}) {
  const renderDelete = () => (
    <Pressable style={styles.deleteBtn} onPress={onDelete}>
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  );

  return (
    <Swipeable renderLeftActions={renderDelete} renderRightActions={renderDelete}>
      <Pressable onPress={onPress} style={styles.row}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.meta}>User #{user.id}</Text>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "800", color: "#111827" },
  meta: { marginTop: 4, fontSize: 12, opacity: 0.6 },
  deleteBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 96,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "#EF4444",
  },
  deleteText: { color: "white", fontWeight: "900" },
});
