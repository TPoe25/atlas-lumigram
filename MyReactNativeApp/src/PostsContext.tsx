// src/PostsContext.tsx
 import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type Post = {
  id: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  createdAt?: any;
};

type PostsContextValue = {
  user: User | null;
  uid: string | null;
  posts: Post[];
  favoriteIds: Set<string>;
  toggleFavorite: (postId: string) => Promise<void>;
  addPost: (input: { imageUrl: string; caption?: string }) => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within <PostsProvider />");
  return ctx;
}

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const uid = user?.uid ?? null;

  const [posts, setPosts] = useState<Post[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("AUTH STATE:", u ? "signed in" : "signed out");
      setUser(u);
    });
    return unsub;
  }, []);

  // Posts feed listener (ONLY when signed in)
  useEffect(() => {
    console.log("AUTH UID (PostsContext):", uid ?? "none");

    // If signed out, do NOT subscribe (rules require signedIn()).
    if (!uid) {
      setPosts([]);
      return;
    }

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Post[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Post, "id">),
        }));
        setPosts(next);
      },
      (error) => {
        console.error("Posts snapshot error:", error);
        setPosts([]);
      }
    );

    return unsub;
  }, [uid]);

  // Favorites listener (ONLY when signed in)
  useEffect(() => {
    if (!uid) {
      setFavoriteIds(new Set());
      return;
    }

    const favCol = collection(db, "favorites", uid, "posts");
    const unsub = onSnapshot(
      favCol,
      (snap) => {
        const s = new Set<string>();
        snap.forEach((d) => s.add(d.id));
        setFavoriteIds(s);
      },
      (error) => {
        console.error("Favorites snapshot error:", error);
        setFavoriteIds(new Set());
      }
    );

    return unsub;
  }, [uid]);

  async function toggleFavorite(postId: string) {
    if (!uid) throw new Error("Must be signed in to favorite posts.");
    const ref = doc(db, "favorites", uid, "posts", postId);

    if (favoriteIds.has(postId)) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { createdAt: serverTimestamp() }, { merge: true });
    }
  }

  async function addPost(input: { imageUrl: string; caption?: string }) {
    if (!uid) throw new Error("Must be signed in to create posts.");

    // If you already have an add-post flow elsewhere, keep using it.
    // This is a minimal safe example.
    const { addDoc } = await import("firebase/firestore");
    await addDoc(collection(db, "posts"), {
      userId: uid,
      imageUrl: input.imageUrl,
      caption: input.caption ?? "",
      createdAt: serverTimestamp(),
    });
  }

  const value = useMemo(
    () => ({
      user,
      uid,
      posts,
      favoriteIds,
      toggleFavorite,
      addPost,
    }),
    [user, uid, posts, favoriteIds]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}
