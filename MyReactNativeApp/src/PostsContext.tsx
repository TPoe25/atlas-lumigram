// src/PostsContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  DocumentData,
  startAfter,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { uploadPostImage } from "./uploadImage";

export type Post = {
  id: string;
  uid: string;
  userId?: string;
  imageUrl: string;
  caption?: string;
  text?: string;
  createdAt?: any;
};

type PostsContextValue = {
  user: User | null;
  uid: string | null;
  posts: Post[];
  favoritePosts: Post[];
  favoriteIds: Set<string>;
  isFavorite: (postId: string) => boolean;
  toggleFavorite: (postId: string) => Promise<void>;
  addPost: (input: { imageUri?: string; imageUrl?: string; caption?: string; text?: string }) => Promise<void>;
  searchPosts: (term: string) => Promise<Post[]>;
  refreshFeed: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshingFeed: boolean;
  loadingMorePosts: boolean;
  loadingFeed: boolean;
  hasMorePosts: boolean;
};

const PostsContext = createContext<PostsContextValue | null>(null);
const POSTS_PAGE_SIZE = 10;

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within <PostsProvider />");
  return ctx;
}

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const uid = user?.uid ?? null;

  const [posts, setPosts] = useState<Post[]>([]);
  const [lastPostDoc, setLastPostDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [refreshingFeed, setRefreshingFeed] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const feedBaseQuery = useMemo(
    () => query(collection(db, "posts"), orderBy("createdAt", "desc")),
    []
  );

  function normalizePostDoc(d: QueryDocumentSnapshot<DocumentData>): Post {
    const data = d.data() as Partial<Post> & { userId?: string; uid?: string };
    return {
      id: d.id,
      uid: data.uid ?? data.userId ?? "",
      userId: data.userId ?? data.uid ?? "",
      imageUrl: data.imageUrl ?? "",
      caption: data.caption ?? "",
      text: data.text ?? data.caption ?? "",
      createdAt: data.createdAt,
    };
  }

  const fetchFirstPage = useCallback(async () => {
    if (!uid) return;
    const snap = await getDocs(query(feedBaseQuery, limit(POSTS_PAGE_SIZE)));
    const next = snap.docs.map(normalizePostDoc);
    setPosts(next);
    setLastPostDoc(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null);
    setHasMorePosts(snap.docs.length === POSTS_PAGE_SIZE);
  }, [uid, feedBaseQuery]);

  const refreshFeed = useCallback(async () => {
    if (!uid) return;
    setRefreshingFeed(true);
    try {
      await fetchFirstPage();
    } finally {
      setRefreshingFeed(false);
    }
  }, [uid, fetchFirstPage]);

  const loadMorePosts = useCallback(async () => {
    if (!uid || !lastPostDoc || !hasMorePosts || loadingMorePosts) return;
    setLoadingMorePosts(true);
    try {
      const snap = await getDocs(
        query(feedBaseQuery, startAfter(lastPostDoc), limit(POSTS_PAGE_SIZE))
      );
      const next = snap.docs.map(normalizePostDoc);
      setPosts((prev) => [...prev, ...next]);
      setLastPostDoc(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : lastPostDoc);
      setHasMorePosts(snap.docs.length === POSTS_PAGE_SIZE);
    } finally {
      setLoadingMorePosts(false);
    }
  }, [uid, lastPostDoc, hasMorePosts, loadingMorePosts, feedBaseQuery]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  // Feed load (ONLY when signed in)
  useEffect(() => {
    if (!uid) {
      setPosts([]);
      setLastPostDoc(null);
      setHasMorePosts(false);
      setLoadingFeed(false);
      return;
    }

    let mounted = true;
    setLoadingFeed(true);
    fetchFirstPage()
      .catch((error) => {
        console.error("Feed load error:", error);
        if (mounted) setPosts([]);
      })
      .finally(() => {
        if (mounted) setLoadingFeed(false);
      });

    return () => {
      mounted = false;
    };
  }, [uid, fetchFirstPage]);

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

  const isFavorite = useCallback(
    (postId: string) => favoriteIds.has(postId),
    [favoriteIds]
  );

  const favoritePosts = useMemo(
    () => posts.filter((p) => favoriteIds.has(p.id)),
    [posts, favoriteIds]
  );

  async function addPost(input: { imageUri?: string; imageUrl?: string; caption?: string; text?: string }) {
    if (!uid) throw new Error("Must be signed in to create posts.");
    const caption = (input.caption ?? "").trim();
    const text = (input.text ?? caption).trim();

    const postRef = doc(collection(db, "posts"));
    const imageUrl =
      input.imageUrl ??
      (input.imageUri
        ? await uploadPostImage({ uid, postId: postRef.id, imageUri: input.imageUri })
        : null);

    if (!imageUrl) throw new Error("No image provided.");

    await setDoc(postRef, {
      uid,
      userId: uid,
      imageUrl,
      caption,
      text,
      createdAt: serverTimestamp(),
    });

    await refreshFeed();
  }

  const searchPosts = useCallback(
    async (term: string) => {
      const q = term.trim().toLowerCase();
      if (!q) return [];
      return posts.filter((p) => {
        const caption = (p.caption ?? "").toLowerCase();
        const text = (p.text ?? "").toLowerCase();
        return caption.includes(q) || text.includes(q);
      });
    },
    [posts]
  );

  const value = useMemo(
    () => ({
      user,
      uid,
      posts,
      favoritePosts,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      addPost,
      searchPosts,
      refreshFeed,
      loadMorePosts,
      refreshingFeed,
      loadingMorePosts,
      loadingFeed,
      hasMorePosts,
    }),
    [
      user,
      uid,
      posts,
      favoritePosts,
      favoriteIds,
      isFavorite,
      searchPosts,
      refreshFeed,
      loadMorePosts,
      refreshingFeed,
      loadingMorePosts,
      loadingFeed,
      hasMorePosts,
    ]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}
