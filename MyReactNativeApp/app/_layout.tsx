import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PostsProvider } from "../src/PostsContext";
import { ProfileProvider } from "../src/ProfileContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileProvider>
        <PostsProvider>
          <Stack screenOptions={{ headerTitleAlign: "center" }} />
        </PostsProvider>
      </ProfileProvider>
    </GestureHandlerRootView>
  );
}
