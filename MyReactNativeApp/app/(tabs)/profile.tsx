import { View, Text, StyleSheet, Image, Pressable, Dimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { usePosts } from "../../src/PostsContext";
import { useProfile } from "../../src/ProfileContext";

const GAP = 10;
const PADDING = 16;

export default function ProfileTab() {
  const { posts } = usePosts();
  const { profile } = useProfile();

  const width = Dimensions.get("window").width;
  const tile = Math.floor((width - PADDING * 2 - GAP * 2) / 3);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/(tabs)/edit-profile")} style={styles.avatarPress}>
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={{ fontWeight: "900", opacity: 0.7 }}>+</Text>
            </View>
          )}
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.sub}>{posts.length} posts</Text>
        </View>
      </View>

      <FlashList
        data={posts}
        numColumns={3}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View style={[styles.tileWrap, { width: tile, height: tile }]}>
            <Image source={{ uri: item.imageUrl }} style={styles.tileImg} />
          </View>
        )}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F3F4F6" },

  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarPress: { borderRadius: 999 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#E5E7EB" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },

  username: { fontSize: 20, fontWeight: "900", color: "#0F172A" },
  sub: { marginTop: 2, opacity: 0.75, fontWeight: "700" },

  grid: { paddingHorizontal: 16, paddingBottom: 16 },
  tileWrap: {
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  tileImg: { width: "100%", height: "100%" },
});
