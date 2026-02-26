import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PostsProvider } from "../src/PostsContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PostsProvider>
    </GestureHandlerRootView>
  );
}
