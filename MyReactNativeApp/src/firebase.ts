import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import * as FirebaseAuth from "firebase/auth";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function assertEnv(name: keyof typeof firebaseConfig) {
  if (!firebaseConfig[name]) {
    throw new Error(
      `Missing ${name}. Set EXPO_PUBLIC_FIREBASE_* in .env and restart Expo.`
    );
  }
}

assertEnv("apiKey");
if (Platform.OS === "web") {
  assertEnv("authDomain");
}
assertEnv("projectId");
assertEnv("storageBucket");
assertEnv("messagingSenderId");
assertEnv("appId");

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  if (Platform.OS === "web") {
    return FirebaseAuth.getAuth(app);
  }

  const getReactNativePersistence = (FirebaseAuth as any).getReactNativePersistence as
    | ((storage: typeof AsyncStorage) => FirebaseAuth.Persistence)
    | undefined;

  // initializeAuth must only run once per app instance.
  // Fallback to getAuth in hot-reload/already-initialized cases.
  try {
    if (typeof getReactNativePersistence === "function") {
      return FirebaseAuth.initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
    return FirebaseAuth.getAuth(app);
  } catch {
    return FirebaseAuth.getAuth(app);
  }
}

export const auth = createAuth();

export const db = getFirestore(app);
export const storage = getStorage(app);
