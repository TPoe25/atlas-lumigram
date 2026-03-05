import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export function FeedCard({
    imageUrl,
    caption,
    favorited,
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
                .runOnJS(true)
                .onStart(() => setShowCaption(true))
                .onEnd(() => setShowCaption(false)),
        []
    );

    const doubleTap = useMemo(
        () =>
            Gesture.Tap()
                .numberOfTaps(2)
                .runOnJS(true)
                .onEnd(() => onDoubleTap?.()),
        [onDoubleTap]
    );

    const gesture = Gesture.Simultaneous(doubleTap, longPress);

    return (
        <View style={styles.card}>
            <GestureDetector gesture={gesture}>
                <View style={styles.imageWrap}>
                    <Image source={{ uri: imageUrl }} style={styles.image} />

                    {showCaption ? (
                        <View style={styles.captionOverlay}>
                            <Text style={styles.captionText} numberOfLines={2}>
                                {caption}
                            </Text>
                        </View>
                    ) : null}

                    {favorited ? <View style={styles.badge}><Text style={styles.badgeText}>★</Text></View> : null}
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
    imageWrap: { width: "100%", aspectRatio: 1, backgroundColor: "#F3F4F6" },
    image: { width: "100%", height: "100%" },

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

    badge: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.55)",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    badgeText: { color: "white", fontWeight: "900" },
});
