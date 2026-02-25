import { View, Text, StyleSheet, Pressable } from "react-native";
import type { Activity } from "./db";

function meta(label: string, value: string | number | null | undefined) {
    if (value === null || value === undefined) return null;
    const str = String(value).trim();
    if (!str) return null;

    return (
        <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>{label}:</Text> {str}
        </Text>
    );
}

export function ActivityRow({
    a,
    onDelete,
    onPress,
}: {
    a: Activity;
    onDelete?: () => void;
    onPress?: () => void;
}) {
    const isStrength = a.kind === "strength";

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [
                styles.card,
                pressed && onPress ? { opacity: 0.92 } : null,
            ]}
        >
            <View style={styles.topRow}>
                <Text style={styles.title} numberOfLines={1}>
                    {a.title}
                </Text>

                <View style={styles.rightTop}>
                    <Text style={styles.badge}>
                        {isStrength ? "Strength" : "Conditioning"}
                    </Text>

                    {onDelete ? (
                        <Pressable
                            onPress={onDelete}
                            style={({ pressed }) => [
                                styles.deleteBtn,
                                pressed ? { opacity: 0.85 } : null,
                            ]}
                            hitSlop={8}
                        >
                            <Text style={styles.deleteText}>Delete</Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>

            <View style={styles.metaBlock}>
                {isStrength ? (
                    <>
                        {meta("Sets", a.sets)}
                        {meta("Reps", a.reps)}
                        {meta("Weight", a.weight)}
                    </>
                ) : (
                    <>
                        {meta("Minutes", a.duration_minutes)}
                        {meta("Miles", a.distance_miles)}
                    </>
                )}
                {meta("Notes", a.notes)}
                {meta("Added", a.created_at)}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#fff",
        marginBottom: 12,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        justifyContent: "space-between",
    },
    title: { fontSize: 16, fontWeight: "900", flex: 1, color: "#0F172A" },
    rightTop: { flexDirection: "row", alignItems: "center", gap: 8 },
    badge: {
        fontSize: 12,
        fontWeight: "900",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#0F172A",
        color: "white",
    },
    deleteBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#FEE2E2",
        borderWidth: 1,
        borderColor: "#FCA5A5",
    },
    deleteText: { fontSize: 12, fontWeight: "900", color: "#991B1B" },
    metaBlock: { marginTop: 10, gap: 4 },
    metaText: { fontSize: 13, color: "#111827" },
    metaLabel: { fontWeight: "900" },
});
