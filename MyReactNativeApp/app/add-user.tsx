import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { addUser, initDb } from "../src/db";

export default function AddUser() {
  const [name, setName] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Add User</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name (ex: Taylor, Devon, etc.)"
        style={styles.input}
      />

      <Pressable
        style={styles.primaryBtn}
        onPress={() => {
          initDb();
          addUser(name);
          router.back();
        }}
      >
        <Text style={styles.primaryText}>Save</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
        <Text style={styles.secondaryText}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: "#F3F4F6" },
  h1: { fontSize: 28, fontWeight: "900", marginBottom: 14, color: "#111827" },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#111827",
    marginBottom: 10,
  },
  primaryText: { color: "white", fontWeight: "900" },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryText: { fontWeight: "900", color: "#111827" },
});
