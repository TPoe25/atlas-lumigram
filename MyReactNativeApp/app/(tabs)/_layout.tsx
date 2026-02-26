import { Tabs, router } from "expo-router";
import { Pressable, Text } from "react-native";


export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        headerRight: () => (
          <Pressable
            onPress={() => router.replace("/(auth)/login")}
            style={{ paddingRight: 14 }}
          >
            <Text style={{ fontWeight: "800" }}>Logout</Text>
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="add-post" options={{ title: "Add Post" }} />
      <Tabs.Screen name="favorites" options={{ title: "Favorites" }} />
      <Tabs.Screen name="profile" options={{ title: "My Profile" }} />
    </Tabs>
  );
}
