import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from "react-native-reanimated";

export function SwipeToDelete({
    children,
    onDelete,
}: {
    children: React.ReactNode;
    onDelete: () => void;
}) {
    // how far the row can slide left to reveal the delete button
    const MAX_SWIPE = 92;

    const translateX = useSharedValue(0);

    const pan = Gesture.Pan()
        .onUpdate((e) => {
            // allow swiping left only (negative values)
            const next = Math.min(0, Math.max(-MAX_SWIPE, e.translationX));
            translateX.value = next;
        })
        .onEnd(() => {
            // snap open if swiped far enough, otherwise close
            const shouldOpen = translateX.value < -MAX_SWIPE / 2;
            translateX.value = withTiming(shouldOpen ? -MAX_SWIPE : 0, { duration: 160 });
        });

    const rowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    function close() {
        translateX.value = withTiming(0, { duration: 140 });
    }

    function handleDelete() {
        close();
        // run delete after closing animation starts (safe & smooth)
        runOnJS(onDelete)();
    }

    return (
        <View style={styles.container}>
            {/* Background delete button */}
            <View style={styles.behind}>
                <Pressable onPress={handleDelete} style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
            </View>

            {/* Foreground swipeable content */}
            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.foreground, rowStyle]}>{children}</Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 12,
    },
    behind: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingRight: 8,
        borderRadius: 14,
        overflow: "hidden",
    },
    deleteBtn: {
        width: 84,
        height: "100%",
        borderRadius: 14,
        backgroundColor: "#FEE2E2",
        borderWidth: 1,
        borderColor: "#FCA5A5",
        alignItems: "center",
        justifyContent: "center",
    },
    deleteText: {
        color: "#991B1B",
        fontWeight: "900",
    },
    foreground: {
        borderRadius: 14,
        overflow: "hidden",
    },
});
