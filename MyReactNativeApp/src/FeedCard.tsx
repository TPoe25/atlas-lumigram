// src/FeedCard.tsx
import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export function FeedCard({
    imageUrl,
    caption,
    favorited = false,
    onDoubleTap,
}: {
    imageUrl: string;
    caption: string;
    favorited?: boolean;
    onDoubleTap?: () => void;
}) {
    const [showCaption, setShowCaption] = useState(false);

    const longPress = useMemo(
        () =>
            Gesture.LongPress()
                .minDuration(250)
                .runOnJS(true) // ✅ critical for setState
                .onBegin(() => {
                    setShowCaption(true);
                })
                .onFinalize(() => {
                    setShowCaption(false);
                }),
        []
    );

    const doubleTap = useMemo(
        () =>
            Gesture.Tap()
                .numberOfTaps(2)
                .maxDuration(250)
                .runOnJS(true)
                .onEnd(() => {
                    onDoubleTap?.();
                }),
        [onDoubleTap]
    );

    const gesture = Gesture.Simultaneous(doubleTap, longPress);

    return (
        <View style={styles.card}>
            <GestureDetector gesture={gesture}>
                <View style={styles.imageWrap}>
                    <Image source={{ uri: imageUrl }} style={styles.image} />

                    {/* small favorited badge */}
                    {favorited ? (
                        <View style={styles.favBadge}>
                            <Text style={styles.favText}>★</Text>
                        </View>
                    ) : null}

                    {showCaption ? (
                        <View style={styles.captionOverlay}>
                            <Text style={styles.captionText} numberOfLines={2}>
                                {caption}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </GestureDetector>
        </View>
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
    image: {
        width: "100%",
        height: "100%",
    },
    captionOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    captionText: {
        color: "white",
        fontWeight: "800",
    },
    favBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0,0,0,0.65)",
        borderRadius: 14,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    favText: {
        color: "gold",
        fontWeight: "900",
    },
});
