import { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { addStrengthActivity, addConditioningActivity } from "../../../src/db";

type Mode = "strength" | "conditioning";

export default function AddActivity() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const userId = useMemo(() => Number(id), [id]);

    const [mode, setMode] = useState<Mode>("strength");

    const [title, setTitle] = useState("");

    // strength
    const [sets, setSets] = useState("3");
    const [reps, setReps] = useState("10");
    const [weight, setWeight] = useState("");

    // conditioning
    const [durationMinutes, setDurationMinutes] = useState("20");
    const [distanceMiles, setDistanceMiles] = useState("");

    const [notes, setNotes] = useState("");

    function save() {
        const t = title.trim();
        if (!t) return;

        if (mode === "strength") {
            addStrengthActivity({
                userId,
                title: t,
                sets: Number(sets || 0),
                reps: Number(reps || 0),
                weight: weight.trim() ? Number(weight) : undefined,
                notes: notes.trim() || undefined,
            });
        } else {
            addConditioningActivity({
                userId,
                title: t,
                durationMinutes: Number(durationMinutes || 0),
                distanceMiles: distanceMiles.trim() ? Number(distanceMiles) : undefined,
                notes: notes.trim() || undefined,
            });
        }

        router.back();
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#F3F4F6" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.page}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.h1}>Add Activity</Text>

                <View style={styles.segmentRow}>
                    <Pressable
                        onPress={() => setMode("strength")}
                        style={[styles.segment, mode === "strength" && styles.segmentActive]}
                    >
                        <Text style={[styles.segmentText, mode === "strength" && styles.segmentTextActive]}>
                            Strength
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setMode("conditioning")}
                        style={[styles.segment, mode === "conditioning" && styles.segmentActive]}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                mode === "conditioning" && styles.segmentTextActive,
                            ]}
                        >
                            Conditioning
                        </Text>
                    </Pressable>
                </View>

                <TextInput
                    placeholder="Title (ex: Bench, 3-mile run)"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                    multiline
                    allowFontScaling={false}
                />

                {mode === "strength" ? (
                    <>
                        <TextInput
                            placeholder="Sets"
                            value={sets}
                            onChangeText={setSets}
                            keyboardType="number-pad"
                            style={styles.input}
                            multiline
                            allowFontScaling={false}
                        />
                        <TextInput
                            placeholder="Reps"
                            value={reps}
                            onChangeText={setReps}
                            keyboardType="number-pad"
                            style={styles.input}
                            multiline
                            allowFontScaling={false}
                        />
                        <TextInput
                            placeholder="Weight (optional)"
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="decimal-pad"
                            style={styles.input}
                            multiline
                            allowFontScaling={false}
                        />
                    </>
                ) : (
                    <>
                        <TextInput
                            placeholder="Duration (minutes)"
                            value={durationMinutes}
                            onChangeText={setDurationMinutes}
                            keyboardType="number-pad"
                            style={styles.input}
                            multiline
                            allowFontScaling={false}
                        />
                        <TextInput
                            placeholder="Distance (miles, optional)"
                            value={distanceMiles}
                            onChangeText={setDistanceMiles}
                            keyboardType="decimal-pad"
                            style={styles.input}
                            multiline
                            allowFontScaling={false}
                        />
                    </>
                )}

                <TextInput
                    placeholder="Notes (optional)"
                    value={notes}
                    onChangeText={setNotes}
                    style={[styles.input, styles.notes]}
                    multiline
                    allowFontScaling={false}
                />

                <Pressable onPress={save} style={styles.saveBtn}>
                    <Text style={styles.saveText}>Save</Text>
                </Pressable>

                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>Go back</Text>
                </Pressable>

                {/* extra space so last input + buttons aren't hidden */}
                <View style={{ height: 24 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: {
        padding: 20,
        paddingTop: 28,
        width: "100%",
        maxWidth: 820,
        alignSelf: "center",
        gap: 14,
    },
    h1: { fontSize: 40, fontWeight: "900", color: "#0F172A", marginBottom: 4 },

    segmentRow: { flexDirection: "row", gap: 12, marginBottom: 6 },
    segment: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 16,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignItems: "center",
    },
    segmentActive: { backgroundColor: "#0F172A", borderColor: "#0F172A" },
    segmentText: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
    segmentTextActive: { color: "white" },

    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 14,
        fontSize: 16,
        lineHeight: 20,
    },

    notes: {
        minHeight: 120,
        paddingTop: 14,
        textAlignVertical: "top",
    },


    saveBtn: {
        backgroundColor: "#0F172A",
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: "center",
        marginTop: 6,
    },
    saveText: { color: "white", fontSize: 18, fontWeight: "900" },

    backBtn: {
        backgroundColor: "white",
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    backText: { color: "#0F172A", fontWeight: "800" },
});
