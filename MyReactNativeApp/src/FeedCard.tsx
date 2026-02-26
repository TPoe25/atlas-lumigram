import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Image } from "expo-image";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

type Props = {
  imageUrl: string;
  caption: string;
};

export function FeedCard({ imageUrl, caption }: Props) {
  const [showCaption, setShowCaption] = useState(false);

  const longPress = Gesture.LongPress()
    .minDuration(350)
    .onStart(() => {
      setShowCaption(true);
    })
    .onFinalize(() => {
      setShowCaption(false);
    })
    .runOnJS(true);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      Alert.alert("Favorited ⭐️", "Double tap detected");
    })
    .runOnJS(true);

  const composed = Gesture.Exclusive(doubleTap, longPress);

  return (
    <GestureDetector gesture={composed}>
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
          />

          {showCaption && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{caption}</Text>
            </View>
          )}
        </View>

        {/* Default caption below image */}
        <View style={styles.captionContainer}>
          <Text style={styles.captionText} numberOfLines={2}>
            {caption}
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",

    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  imageWrapper: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 360,
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15,23,42,0.75)",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  overlayText: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },

  captionContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  captionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
});
