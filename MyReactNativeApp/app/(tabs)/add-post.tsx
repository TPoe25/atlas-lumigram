import { View, Text } from "react-native";

export default function AddPostTab() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>Add Post</Text>
            <Text>Later: upload post + image to Firebase.</Text>
        </View>
    );
}
