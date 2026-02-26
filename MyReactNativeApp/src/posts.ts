// src/posts.ts
export type Post = {
    id: string;
    imageUrl: string;
    caption: string;
    createdAt: string;
};

export const INITIAL_POSTS: Post[] = [
    {
        id: "1",
        imageUrl: "https://picsum.photos/800/600?random=1",
        caption: "Placeholder post",
        createdAt: new Date().toISOString(),
    },
];
