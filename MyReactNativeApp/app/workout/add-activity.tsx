import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { auth } from "../../src/firebase";
import { addWorkoutLog } from "../../src/workouts/logs";

export default function AddWorkoutActivityScreen() {
  const p = useLocalSearchParams<{
    name?: string;
    type?: string;
    muscle?: string;
    difficulty?: string;
    instructions?: string;
    gifUrl?: string;
  }>();

  const [exerciseName, setExerciseName] = useState(p.name ?? "Workout");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState(p.instructions ?? "");
  const [saving, setSaving] = useState(false);

  const meta = useMemo(
    () =>
      [
        p.type ? `Type: ${p.type}` : null,
        p.muscle ? `Muscle: ${p.muscle}` : null,
        p.difficulty ? `Difficulty: ${p.difficulty}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    [p.type, p.muscle, p.difficulty]
  );

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/search");
  }

  async function saveActivity() {
    const current = auth.currentUser;
    if (!current) {
      Alert.alert("Sign in required", "Please log in to add activities.");
      return;
    }

    const name = exerciseName.trim();
    if (!name) {
      Alert.alert("Missing name", "Please enter an exercise name.");
      return;
    }

    const parsedSets = Number(sets);
    const parsedReps = Number(reps);
    const parsedWeight = weight.trim() ? Number(weight) : undefined;

    if (!Number.isFinite(parsedSets) || parsedSets <= 0) {
      Alert.alert("Invalid sets", "Enter a valid number of sets.");
      return;
    }
    if (!Number.isFinite(parsedReps) || parsedReps <= 0) {
      Alert.alert("Invalid reps", "Enter a valid number of reps.");
      return;
    }
    if (weight.trim() && (!Number.isFinite(parsedWeight) || (parsedWeight ?? 0) < 0)) {
      Alert.alert("Invalid weight", "Enter a valid weight.");
      return;
    }

    try {
      setSaving(true);
      await addWorkoutLog({
        uid: current.uid,
        exerciseName: name,
        sets: parsedSets,
        reps: parsedReps,
        weight: parsedWeight,
        notes: notes.trim() || undefined,
      });
      Alert.alert("Saved", "Activity added to your workout log.");
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F3F4F6" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.h1}>Add As Activity</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}

        <TextInput
          value={exerciseName}
          onChangeText={setExerciseName}
          placeholder="Exercise name"
          style={styles.input}
        />
        <TextInput
          value={sets}
          onChangeText={setSets}
          placeholder="Sets"
          keyboardType="number-pad"
          style={styles.input}
        />
        <TextInput
          value={reps}
          onChangeText={setReps}
          placeholder="Reps"
          keyboardType="number-pad"
          style={styles.input}
        />
        <TextInput
          value={weight}
          onChangeText={setWeight}
          placeholder="Weight (optional)"
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes"
          style={[styles.input, styles.notes]}
          multiline
        />

        <Pressable style={styles.primaryBtn} onPress={saveActivity} disabled={saving}>
          <Text style={styles.primaryText}>{saving ? "Saving..." : "Save Activity"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingTop: 18, backgroundColor: "#F3F4F6", gap: 12 },
  backBtn: { alignSelf: "flex-start", marginBottom: 4 },
  backText: { fontWeight: "900", opacity: 0.8 },
  h1: { fontSize: 28, fontWeight: "900", color: "#0F172A" },
  meta: { opacity: 0.75, color: "#111827", marginBottom: 2 },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  notes: { minHeight: 110, textAlignVertical: "top" },
  primaryBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryText: { color: "white", fontWeight: "900" },
});
