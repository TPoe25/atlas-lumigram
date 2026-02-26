import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import type { WorkoutResult } from "../../src/workouts/types";

export function WorkoutRow({
  w,
  onPress,
}: {
  w: WorkoutResult;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}>
      {w.gifUrl ? <Image source={{ uri: w.gifUrl }} style={styles.thumb} /> : <View style={styles.thumbPh} />}

      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {w.name}
        </Text>

        <Text style={styles.meta} numberOfLines={1}>
          {[
            w.muscle && `Muscle: ${w.muscle}`,
            w.difficulty && `• ${w.difficulty}`,
            w.type && `• ${w.type}`,
          ]
            .filter(Boolean)
            .join(" ")}
        </Text>

        {w.equipments?.length ? (
          <Text style={styles.meta2} numberOfLines={1}>
            Equipment: {w.equipments.join(", ")}
          </Text>
        ) : null}
      </View>

      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

export default WorkoutRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#E5E7EB" },
  thumbPh: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#E5E7EB" },
  title: { fontSize: 16, fontWeight: "900", color: "#0F172A" },
  meta: { marginTop: 2, opacity: 0.75, color: "#111827" },
  meta2: { marginTop: 2, opacity: 0.65, color: "#111827" },
  chev: { fontSize: 22, opacity: 0.35, paddingLeft: 6 },
});
