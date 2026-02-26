// src/placeholder.ts
export type Post = {
    id: string;
    imageUrl: string;
    caption: string;
};

export const POSTS: Post[] = [
    {
        id: "1",
        imageUrl: "https://picsum.photos/id/1011/800/800",
        caption: "Leg day — no excuses.",
    },
    {
        id: "2",
        imageUrl: "https://picsum.photos/id/1025/800/800",
        caption: "Speed work today 🏃‍♂️",
    },
    {
        id: "3",
        imageUrl: "https://picsum.photos/id/1035/800/800",
        caption: "Upper body strength session.",
    },
];

export const FAVORITES: Post[] = [
    {
        id: "f1",
        imageUrl: "https://picsum.photos/id/1040/800/800",
        caption: "Favorite: form > weight.",
    },
    {
        id: "f2",
        imageUrl: "https://picsum.photos/id/1062/800/800",
        caption: "Favorite: tempo runs hit different.",
    },
    {
        id: "f3",
        imageUrl: "https://picsum.photos/id/1074/800/800",
        caption: "Favorite: consistency wins.",
    },
];
