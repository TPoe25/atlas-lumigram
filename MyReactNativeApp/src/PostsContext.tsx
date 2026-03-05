import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Post } from "./posts";
import { INITIAL_POSTS } from "./posts";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

type PostsCtx = {
  posts: Post[];
  favoriteIds: Set<string>;
  favoritePosts: Post[];
  addPost: (p: { imageUrl: string; caption: string }) => Promise<void>;
  toggleFavorite: (postId: string) => Promise<void>;
  isFavorite: (postId: string) => boolean;
};

const Ctx = createContext<PostsCtx | null>(null);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
      console.log("AUTH UID (PostsContext):", u?.uid ?? "none");
    });
    return unsub;
  }, []);

  useEffect(() => {
    const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      qPosts,
      (snap) => {
        const next: Post[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            imageUrl: data.imageUrl ?? "",
            caption: data.caption ?? "",
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
            favorited: false,
          };
        });
        setPosts(next);
      },
      (error) => {
        console.error("Posts snapshot error:", error);
        setPosts([]);
      }
    );

    return unsub;
  }, []);

  useEffect(() => {
    if (!uid) {
      setFavoriteIds(new Set());
      return;
    }

    const favCol = collection(db, "favorites", uid, "posts");

    const unsub = onSnapshot(
      favCol,
      (snap) => {
        const ids = new Set<string>();
        snap.docs.forEach((d) => ids.add(d.id));
        setFavoriteIds(ids);
      },
      (error) => {
        console.error("Favorites snapshot error:", error);
        setFavoriteIds(new Set());
      }
    );

    return unsub;
  }, [uid]);

  const favoritePosts = useMemo(() => posts.filter((p) => favoriteIds.has(p.id)), [posts, favoriteIds]);

  async function addPost(p: { imageUrl: string; caption: string }) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");

    await addDoc(collection(db, "posts"), {
      userId: user.uid,
      imageUrl: p.imageUrl,
      caption: p.caption,
      createdAt: serverTimestamp(),
    });
  }

  async function toggleFavorite(postId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");

    const favDoc = doc(db, "favorites", user.uid, "posts", postId);

    if (favoriteIds.has(postId)) {
      await deleteDoc(favDoc);
    } else {
      await setDoc(favDoc, { createdAt: serverTimestamp() });
    }
  }

  function isFavorite(postId: string) {
    return favoriteIds.has(postId);
  }

  const value = useMemo(
    () => ({
      posts: posts.map((p) => ({ ...p, favorited: favoriteIds.has(p.id) })),
      favoriteIds,
      favoritePosts,
      addPost,
      toggleFavorite,
      isFavorite,
    }),
    [posts, favoriteIds, favoritePosts]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePosts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePosts must be used inside PostsProvider");
  return ctx;
}
