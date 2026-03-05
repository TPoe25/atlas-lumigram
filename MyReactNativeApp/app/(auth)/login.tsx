import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    const e = email.trim();
    if (!e || !password) {
      Alert.alert("Missing info", "Enter email and password.");
      return;
    }

    try {
      setBusy(true);
      await signInWithEmailAndPassword(auth, e, password);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      Alert.alert("Login failed", err?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0F172A" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>

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

          <Pressable onPress={login} style={styles.primaryBtn} disabled={busy}>
            <Text style={styles.primaryText}>{busy ? "Logging in…" : "Login"}</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/(auth)/register")} style={styles.linkBtn}>
            <Text style={styles.linkText}>Create a new account</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 34, fontWeight: "900", color: "white" },
  subtitle: { marginTop: 6, fontSize: 16, color: "#CBD5E1", marginBottom: 18 },

  card: { backgroundColor: "white", borderRadius: 18, padding: 18 },
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
