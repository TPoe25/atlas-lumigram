export type Post = {
    id: string;
    imageUrl: string;
    caption: string;
};

export const POSTS: Post[] = [
    {
        id: "1",
        imageUrl: "https://picsum.photos/id/1011/800/800",
        caption: "Morning lift session 💪",
    },
    {
        id: "2",
        imageUrl: "https://picsum.photos/id/1025/800/800",
        caption: "Conditioning day 🏃‍♂️",
    },
    {
        id: "3",
        imageUrl: "https://picsum.photos/id/1003/800/800",
        caption: "Leg day. Again. 😭",
    },
    {
        id: "4",
        imageUrl: "https://picsum.photos/id/1015/800/800",
        caption: "Recovery + mobility",
    },
];
