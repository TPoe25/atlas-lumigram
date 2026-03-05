import { Stack } from "expo-router";
import { PostsProvider } from "../src/PostsContext";
import { ProfileProvider } from "../src/ProfileContext";
import "../src/firebase";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <PostsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PostsProvider>
    </ProfileProvider>
  );
}
