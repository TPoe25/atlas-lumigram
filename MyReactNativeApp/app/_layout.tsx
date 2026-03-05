import { Stack } from "expo-router";
import { PostsProvider } from "../src/PostsContext";
import { ProfileProvider } from "../src/ProfileContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../src/firebase";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PostsProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </PostsProvider>
      </GestureHandlerRootView>
    </ProfileProvider>
  );
}
