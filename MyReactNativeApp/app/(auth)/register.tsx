import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function createAccount() {
    // No real auth yet (Step 2). Just route into the logged-in app.
    router.replace("/(tabs)/home");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0F172A" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start tracking your progress</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={styles.input}
          />

          <Pressable onPress={createAccount} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Create Account</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/(auth)/login")} style={styles.linkBtn}>
            <Text style={styles.linkText}>Login to an existing account</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: { fontSize: 34, fontWeight: "900", color: "white" },
  subtitle: { marginTop: 6, fontSize: 16, color: "#CBD5E1", marginBottom: 18 },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
  },
  label: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  input: {
    marginTop: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "900" },

  linkBtn: { marginTop: 14, alignItems: "center" },
  linkText: { fontSize: 14, fontWeight: "800", color: "#0F172A", opacity: 0.85 },
});
