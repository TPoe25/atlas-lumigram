import { View, Text } from "react-native";

export default function SearchTab() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>Search</Text>
            <Text>Later: API search + save to Result Tracker.</Text>
        </View>
    );
}
