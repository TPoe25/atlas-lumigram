// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../../src/firebase";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) await signInAnonymously(auth);
      } finally {
        setReady(true);
      }
    });
    return unsub;
  }, []);

  if (!ready) return null; // or a splash/loading view

  return <Stack screenOptions={{ headerShown: false }} />;
}
