import { useEffect, useState } from "react";
import { Stack, router, usePathname } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../src/firebase";
import { PostsProvider } from "../src/PostsContext";

function isAuthRoute(pathname: string) {
  return pathname.startsWith("/(auth)");
}

export default function RootLayout() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setReady(true);
      console.log("AUTH STATE:", u ? u.uid : "signed out");
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!user && !isAuthRoute(pathname)) {
      router.replace("/(auth)/login");
      return;
    }

    if (user && isAuthRoute(pathname)) {
      router.replace("/(tabs)/home");
    }
  }, [ready, user, pathname]);

  if (!ready) return null;

  return (
    <PostsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PostsProvider>
  );
}
