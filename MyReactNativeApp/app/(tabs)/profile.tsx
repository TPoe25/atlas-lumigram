import { View, Text } from "react-native";

export default function ProfileTab() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>My Profile</Text>
      <Text>Later: Firebase user profile editing.</Text>
    </View>
  );
}
