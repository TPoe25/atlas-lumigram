import React, { createContext, useContext, useMemo, useState } from "react";
import type { Post } from "./posts";
import { INITIAL_POSTS } from "./posts";

type PostsCtx = {
  posts: Post[];
  favoritePosts: Post[];
  addPost: (p: Omit<Post, "id" | "createdAt" | "favorited">) => void;
  toggleFavorite: (postId: string) => void;
  isFavorite: (postId: string) => boolean;
};

const Ctx = createContext<PostsCtx | null>(null);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const value = useMemo<PostsCtx>(() => {
    const isFavorite = (postId: string) =>
      posts.some((p) => p.id === postId && p.favorited);

    const toggleFavorite = (postId: string) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, favorited: !p.favorited } : p
        )
      );
    };

    const addPost = (p: Omit<Post, "id" | "createdAt" | "favorited">) => {
      const newPost: Post = {
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        favorited: false,
        ...p,
      };
      setPosts((prev) => [newPost, ...prev]);
    };

    const favoritePosts = posts.filter((p) => p.favorited);

    return { posts, favoritePosts, addPost, toggleFavorite, isFavorite };
  }, [posts]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePosts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePosts must be used inside PostsProvider");
  return ctx;
}
