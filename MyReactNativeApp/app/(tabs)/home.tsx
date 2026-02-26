// app/(tabs)/home.tsx
import { View, Text, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { FeedCard } from "../../src/FeedCard";
import { usePosts } from "../../src/PostsContext";

export default function HomeTab() {
  const { posts, toggleFavorite, isFavorite } = usePosts();

  return (
    <View style={styles.page}>
      <Text style={styles.h1}>Home</Text>

      <FlashList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <FeedCard
            imageUrl={item.imageUrl}
            caption={item.caption}
            favorited={isFavorite(item.id)}
            onDoubleTap={() => toggleFavorite(item.id)}
          />
        )}
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
});
