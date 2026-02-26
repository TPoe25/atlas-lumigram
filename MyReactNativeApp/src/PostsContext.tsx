// src/PostsContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import type { Post } from "./posts";
import { INITIAL_POSTS } from "./posts";

type PostsCtx = {
  posts: Post[];
  addPost: (p: Omit<Post, "id" | "createdAt">) => void;
};

const Ctx = createContext<PostsCtx | null>(null);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const value = useMemo(
    () => ({
      posts,
      addPost: (p: Omit<Post, "id" | "createdAt">) => {
        const newPost: Post = {
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
          ...p,
        };
        setPosts((prev) => [newPost, ...prev]);
      },
    }),
    [posts]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePosts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePosts must be used inside PostsProvider");
  return ctx;
}
