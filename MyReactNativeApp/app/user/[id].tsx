import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { SwipeToDelete } from "../../src/SwipeToDelete";
import { ActivityRow } from "../../src/ActivityRow";

import {
    initDb,
    getActivitiesForUser,
    deleteActivity,
    deleteAllActivitiesForUser,
    Activity,
} from "../../src/db";

export default function UserDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const userId = Number(id);

    const [activities, setActivities] = useState<Activity[]>([]);

    const refresh = React.useCallback(() => {
        setActivities(getActivitiesForUser(userId));
    }, [userId]);

    useEffect(() => {
        initDb();
        refresh();
    }, [refresh]);

    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh])
    );

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>User #{userId}</Text>

            <Pressable
                style={styles.primaryBtn}
                onPress={() => router.push(`/user/${userId}/add-activity`)}
            >
                <Text style={styles.primaryText}>Add activity</Text>
            </Pressable>

            <Pressable
                style={styles.secondaryBtn}
                onPress={() => {
                    deleteAllActivitiesForUser(userId);
                    refresh();
                }}
            >
                <Text style={styles.secondaryText}>Delete All Activities</Text>
            </Pressable>

            <Pressable style={styles.linkBtn} onPress={() => router.back()}>
                <Text style={styles.linkText}>Go back</Text>
            </Pressable>

            <View style={{ flex: 1, marginTop: 14 }}>
                <FlashList
                    data={activities}
                    keyExtractor={(a) => String(a.id)}
                    renderItem={({ item }) => (
                        <SwipeToDelete
                            onDelete={() => {
                                deleteActivity(item.id);
                                refresh();
                            }}
                        >
                            <ActivityRow
                                a={item}
                                onPress={() => router.push(`/user/${userId}/edit-activity/${item.id}`)}

                                onDelete={() => {
                                    deleteActivity(item.id);
                                    refresh();
                                }}
                            />
                        </SwipeToDelete>
                    )}

                    ListEmptyComponent={
                        <Text style={styles.empty}>No activities yet. Add one 👇</Text>
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: "#F3F4F6" },
    h1: { fontSize: 28, fontWeight: "900", marginBottom: 14, color: "#111827" },
    primaryBtn: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: "#111827",
        marginBottom: 10,
    },
    primaryText: { color: "white", fontWeight: "900" },
    secondaryBtn: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    secondaryText: { fontWeight: "900", color: "#111827" },
    linkBtn: { marginTop: 10, alignItems: "center" },
    linkText: { fontWeight: "800", opacity: 0.8 },
    empty: { marginTop: 18, opacity: 0.7, color: "#111827" },
});
