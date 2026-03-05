import { ScrollView, View, Text, StyleSheet, Pressable, Image, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { auth, db } from "../../src/firebase";
import { addWorkoutLog } from "../../src/workouts/logs";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function WorkoutDetail() {
    const p = useLocalSearchParams<{
        id: string;
        name?: string;
        type?: string;
        muscle?: string;
        difficulty?: string;
        equipments?: string; // JSON string
        instructions?: string;
        safety_info?: string;
        gifUrl?: string;
    }>();

    const equipments = p.equipments ? (JSON.parse(p.equipments) as string[]) : [];

    function goBack() {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace("/(tabs)/search");
    }

    async function addAsActivity() {
        const current = auth.currentUser;
        if (!current) {
            Alert.alert("Sign in required", "Please log in to add activities.");
            return;
        }

        try {
            await addWorkoutLog({
                uid: current.uid,
                exerciseName: p.name ?? "Workout",
                sets: 3,
                reps: 10,
                notes: p.instructions ?? "",
            });
            Alert.alert("Saved", "Workout added to your activity log.");
        } catch (e: any) {
            Alert.alert("Save failed", e?.message ?? "Unknown error");
        }
    }

    async function saveFavoriteWorkout() {
        const current = auth.currentUser;
        if (!current) {
            Alert.alert("Sign in required", "Please log in to save favorites.");
            return;
        }

        try {
            const workoutId = (p.id ?? p.name ?? "workout").toString().toLowerCase().replace(/\s+/g, "-");
            await setDoc(
                doc(db, "favorites", current.uid, "workouts", workoutId),
                {
                    workoutId,
                    name: p.name ?? "Workout",
                    type: p.type ?? "",
                    muscle: p.muscle ?? "",
                    difficulty: p.difficulty ?? "",
                    gifUrl: p.gifUrl ?? null,
                    instructions: p.instructions ?? "",
                    safety_info: p.safety_info ?? "",
                    createdAt: serverTimestamp(),
                },
                { merge: true }
            );
            Alert.alert("Saved", "Workout saved to favorites.");
        } catch (e: any) {
            Alert.alert("Save failed", e?.message ?? "Unknown error");
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.page}>
            <Pressable onPress={goBack} style={styles.backBtn}>
                <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Text style={styles.h1}>{p.name ?? "Workout"}</Text>

            {p.gifUrl ? <Image source={{ uri: p.gifUrl }} style={styles.gif} /> : null}

            <Text style={styles.meta}>
                {[
                    p.type && `Type: ${p.type}`,
                    p.muscle && `Muscle: ${p.muscle}`,
                    p.difficulty && `Difficulty: ${p.difficulty}`,
                    equipments.length ? `Equipment: ${equipments.join(", ")}` : null,
                ]
                    .filter(Boolean)
                    .join("\n")}
            </Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Instructions</Text>
                <Text style={styles.cardText}>{p.instructions ?? "No instructions provided."}</Text>
            </View>

            {p.safety_info ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Safety Info</Text>
                    <Text style={styles.cardText}>{p.safety_info}</Text>
                </View>
            ) : null}

            <View style={styles.actionsRow}>
                <Pressable style={styles.primaryBtn} onPress={addAsActivity}>
                    <Text style={styles.primaryText}>Add As Activity</Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={saveFavoriteWorkout}>
                    <Text style={styles.secondaryText}>Save Favorite</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { padding: 16, paddingTop: 18, backgroundColor: "#F3F4F6" },
    backBtn: { marginBottom: 10, alignSelf: "flex-start" },
    backText: { fontWeight: "900", opacity: 0.8 },
    h1: { fontSize: 28, fontWeight: "900", color: "#0F172A", marginBottom: 12 },
    gif: { width: "100%", height: 320, borderRadius: 18, backgroundColor: "#E5E7EB" },
    meta: { marginTop: 12, opacity: 0.75, color: "#111827", lineHeight: 20 },
    card: {
        marginTop: 14,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 18,
        padding: 14,
    },
    cardTitle: { fontSize: 16, fontWeight: "900", marginBottom: 8, color: "#0F172A" },
    cardText: { opacity: 0.85, color: "#111827", lineHeight: 20 },
    actionsRow: { flexDirection: "row", gap: 12, marginTop: 18, marginBottom: 8 },
    primaryBtn: {
        flex: 1,
        backgroundColor: "#0F172A",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
    },
    primaryText: { color: "white", fontWeight: "900" },
    secondaryBtn: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    secondaryText: { color: "#0F172A", fontWeight: "900" },
});
