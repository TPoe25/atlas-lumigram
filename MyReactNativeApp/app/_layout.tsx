// app/_layout.tsx
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PostsProvider } from "../src/PostsContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostsProvider>
        <Stack />
      </PostsProvider>
    </GestureHandlerRootView>
  );
}
