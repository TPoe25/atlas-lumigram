// src/FeedCard.tsx
import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type Props = {
    imageUrl: string;
    caption: string;

    // NEW:
    onDoubleTap?: () => void;
    favorited?: boolean;
};

export function FeedCard({ imageUrl, caption, onDoubleTap, favorited }: Props) {
    const [showCaption, setShowCaption] = useState(false);

    const longPress = useMemo(
        () =>
            Gesture.LongPress()
                .minDuration(250)
                .runOnJS(true)
                .onStart(() => setShowCaption(true))
                .onEnd(() => setShowCaption(false)),
        []
    );

    const doubleTap = useMemo(
        () =>
            Gesture.Tap()
                .numberOfTaps(2)
                .maxDelay(250)
                .runOnJS(true)
                .onEnd(() => {
                    onDoubleTap?.();
                }),
        [onDoubleTap]
    );

    const gesture = useMemo(
        () => Gesture.Simultaneous(doubleTap, longPress),
        [doubleTap, longPress]
    );

    return (
        <GestureDetector gesture={gesture}>
            <View style={styles.card}>
                <View style={styles.imageWrap}>
                    <Image source={{ uri: imageUrl }} style={styles.image} />

                    {favorited ? (
                        <View style={styles.favBadge}>
                            <Text style={styles.favBadgeText}>★ Favorite</Text>
                        </View>
                    ) : null}

                    {showCaption ? (
                        <View style={styles.captionOverlay}>
                            <Text style={styles.captionText} numberOfLines={2}>
                                {caption || "Caption (placeholder)"}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 14,
    },
    imageWrap: {
        width: "100%",
        aspectRatio: 1,
        backgroundColor: "#F3F4F6",
    },
    image: { width: "100%", height: "100%" },

    favBadge: {
        position: "absolute",
        top: 10,
        left: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.65)",
    },
    favBadgeText: { color: "white", fontWeight: "900", fontSize: 12 },

    captionOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    captionText: { color: "white", fontWeight: "800" },
});
