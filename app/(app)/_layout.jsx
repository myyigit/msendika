import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

function TabIcon({ focused, emoji }) {
    return (
        <View style={styles.iconWrap}>
            <Text style={styles.emoji}>{emoji}</Text>
            {focused && <View style={styles.dot} />}
        </View>
    );
}

export default function AppLayout() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert('Çıkış Yap', 'Oturumu kapatmak istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Çıkış',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    return (
        <Tabs
            screenOptions={{
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#60a5fa',
                tabBarInactiveTintColor: '#6b7280',
                tabBarLabelStyle: styles.tabLabel,
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitle,
                headerTintColor: '#fff',
                headerRight: () => (
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Çıkış</Text>
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="📊" />,
                }}
            />
            <Tabs.Screen
                name="members"
                options={{
                    title: 'Üyeler',
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="👥" />,
                }}
            />
            <Tabs.Screen
                name="add-member"
                options={{
                    title: 'Yeni Üye',
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="➕" />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Ayarlar',
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="⚙️" />,
                }}
            />
            <Tabs.Screen
                name="member/[id]"
                options={{ href: null }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#111827',
        borderTopColor: '#1f2937',
        borderTopWidth: 1,
        height: 64,
        paddingBottom: 8,
        paddingTop: 8,
    },
    tabLabel: { fontSize: 11, fontWeight: '600' },
    header: {
        backgroundColor: '#111827',
        borderBottomColor: '#1f2937',
        borderBottomWidth: 1,
        elevation: 0,
        shadowOpacity: 0,
    },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
    logoutBtn: {
        marginRight: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#1f2937',
        borderRadius: 8,
    },
    logoutText: { color: '#f87171', fontSize: 13, fontWeight: '600' },
    iconWrap: { alignItems: 'center' },
    emoji: { fontSize: 20 },
    dot: {
        width: 4, height: 4, borderRadius: 2,
        backgroundColor: '#60a5fa', marginTop: 2,
    },
});
