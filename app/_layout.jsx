import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { MemberProvider } from '../context/MemberContext';
import { StatusBar } from 'expo-status-bar';

function AuthGate() {
    const { isAuthenticated, loading, checkSession } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (loading) return;
        const inAuth = segments[0] === '(auth)';
        if (!isAuthenticated && !inAuth) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuth) {
            router.replace('/(app)');
        }
    }, [isAuthenticated, loading]);

    return null;
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <MemberProvider>
                <StatusBar style="light" />
                <AuthGate />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(app)" />
                </Stack>
            </MemberProvider>
        </AuthProvider>
    );
}
