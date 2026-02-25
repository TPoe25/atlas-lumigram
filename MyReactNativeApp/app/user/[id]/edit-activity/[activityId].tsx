import { useEffect, useMemo, useState } from "react";
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
import { getActivityById, updateActivity } from "../../../../src/db";
import type { Activity } from "../../../../src/db";

export default function EditActivity() {
    const { id, activityId } = useLocalSearchParams<{ id: string; activityId: string }>();

    const userId = useMemo(() => Number(id), [id]);
    const actId = useMemo(() => Number(activityId), [activityId]);

    const [activity, setActivity] = useState<Activity | null>(null);

    // shared
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");

    // strength
    const [sets, setSets] = useState("");
    const [reps, setReps] = useState("");
    const [weight, setWeight] = useState("");

    // conditioning
    const [durationMinutes, setDurationMinutes] = useState("");
    const [distanceMiles, setDistanceMiles] = useState("");

    useEffect(() => {
        const a = getActivityById(actId);
        if (!a) return;

        setActivity(a);

        setTitle(a.title);
        setNotes(a.notes || "");

        setSets(a.sets?.toString() ?? "");
        setReps(a.reps?.toString() ?? "");
        setWeight(a.weight?.toString() ?? "");

        setDurationMinutes(a.duration_minutes?.toString() ?? "");
        setDistanceMiles(a.distance_miles?.toString() ?? "");
    }, [actId]);

    if (!activity) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const isStrength = activity.kind === "strength";

    function toIntOrNull(v: string) {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }

    function toFloatOrNull(v: string) {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }

    function save() {
        if (!activity) return;

        const t = title.trim();
        if (!t) return;

        // normalize empties -> null
        const cleanNotes = notes.trim() ? notes.trim() : null;

        if (isStrength) {
            updateActivity(actId, {
                title: t,
                sets: sets.trim() ? toIntOrNull(sets.trim()) : null,
                reps: reps.trim() ? toIntOrNull(reps.trim()) : null,
                weight: weight.trim() ? toFloatOrNull(weight.trim()) : null,
                duration_minutes: null,
                distance_miles: null,
                notes: cleanNotes,
            });
        } else {
            updateActivity(actId, {
                title: t,
                sets: null,
                reps: null,
                weight: null,
                duration_minutes: durationMinutes.trim() ? toIntOrNull(durationMinutes.trim()) : null,
                distance_miles: distanceMiles.trim() ? toFloatOrNull(distanceMiles.trim()) : null,
                notes: cleanNotes,
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
            <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
                <Text style={styles.h1}>Edit Activity</Text>
                <Text style={styles.sub}>
                    User #{userId} • {isStrength ? "Strength" : "Conditioning"}
                </Text>

                <TextInput
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                    allowFontScaling={false}
                />

                {isStrength ? (
                    <>
                        <TextInput
                            placeholder="Sets"
                            value={sets}
                            onChangeText={setSets}
                            keyboardType="number-pad"
                            style={styles.input}
                            allowFontScaling={false}
                        />
                        <TextInput
                            placeholder="Reps"
                            value={reps}
                            onChangeText={setReps}
                            keyboardType="number-pad"
                            style={styles.input}
                            allowFontScaling={false}
                        />
                        <TextInput
                            placeholder="Weight (optional)"
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="decimal-pad"
                            style={styles.input}
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
                            allowFontScaling={false}
                        />
                        <TextInput
                            placeholder="Distance (miles, optional)"
                            value={distanceMiles}
                            onChangeText={setDistanceMiles}
                            keyboardType="decimal-pad"
                            style={styles.input}
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

                <Pressable style={styles.saveBtn} onPress={save}>
                    <Text style={styles.saveText}>Save Changes</Text>
                </Pressable>

                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>Cancel</Text>
                </Pressable>

                <View style={{ height: 24 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    page: {
        padding: 20,
        paddingTop: 28,
        width: "100%",
        maxWidth: 520,
        alignSelf: "center",
        gap: 14,
    },
    h1: { fontSize: 34, fontWeight: "900", color: "#0F172A" },
    sub: { marginTop: -6, opacity: 0.7, fontWeight: "700" },
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
    notes: { minHeight: 120, paddingTop: 14, textAlignVertical: "top" },
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
    backText: { color: "#0F172A", fontSize: 16, fontWeight: "800" },
});
