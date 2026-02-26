import { ScrollView, View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

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

    return (
        <ScrollView contentContainerStyle={styles.page}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
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
});
