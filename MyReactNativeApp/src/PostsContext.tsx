// src/PostsContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import type { Post } from "./posts";
import { INITIAL_POSTS } from "./posts";

type PostsCtx = {
  posts: Post[];
  addPost: (p: Omit<Post, "id" | "createdAt">) => void;

  favorites: string[];               // post ids
  isFavorite: (postId: string) => boolean;
  toggleFavorite: (postId: string) => void;

  favoritePosts: Post[];             // derived list
};

const Ctx = createContext<PostsCtx | null>(null);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [favorites, setFavorites] = useState<string[]>([]);

  const value = useMemo<PostsCtx>(() => {
    const isFavorite = (postId: string) => favorites.includes(postId);

    const toggleFavorite = (postId: string) => {
      setFavorites((prev) =>
        prev.includes(postId) ? prev.filter((id) => id !== postId) : [postId, ...prev]
      );
    };

    const favoritePosts = posts.filter((p) => favorites.includes(p.id));

    return {
      posts,
      addPost: (p) => {
        const newPost: Post = {
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
          ...p,
        };
        setPosts((prev) => [newPost, ...prev]);
      },

      favorites,
      isFavorite,
      toggleFavorite,
      favoritePosts,
    };
  }, [posts, favorites]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePosts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePosts must be used inside PostsProvider");
  return ctx;
}
