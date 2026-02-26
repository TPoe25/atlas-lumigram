// app/(tabs)/favorites.tsx
import { View, Text, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { FeedCard } from "../../src/FeedCard";
import { usePosts } from "../../src/PostsContext";

export default function FavoritesTab() {
    const { favoritePosts, toggleFavorite, isFavorite } = usePosts();

    return (
        <View style={styles.page}>
            <Text style={styles.h1}>Favorites</Text>

            <FlashList
                data={favoritePosts}
                keyExtractor={(p) => p.id}
                renderItem={({ item }) => (
                    <FeedCard
                        imageUrl={item.imageUrl}
                        caption={item.caption}
                        favorited={isFavorite(item.id)}
                        onDoubleTap={() => toggleFavorite(item.id)} // double tap to UNfavorite too
                    />
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>No favorites yet. Double tap a post on Home ★</Text>
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#F3F4F6" },
    h1: {
        fontSize: 28,
        fontWeight: "900",
        color: "#0F172A",
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 12,
    },
    listContent: { paddingHorizontal: 16, paddingBottom: 16 },
    empty: { paddingHorizontal: 16, opacity: 0.7 },
});
