import { View, Text } from "react-native";

export default function FavoritesTab() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>Favorites</Text>
            <Text>Later: saved workouts / saved posts.</Text>
        </View>
    );
}
