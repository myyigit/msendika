import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { MemberProvider } from '../context/MemberContext';
import { ConfigProvider } from '../context/ConfigContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

function AuthGate() {
    const { isAuthenticated, loading, checkSession, isFirstRun } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    useEffect(() => {
        if (loading) return;

        if (isFirstRun) {
            // Hiç kurulum yapılmamış → setup ekranına yönlendir
            router.replace('/(auth)/setup');
            return;
        }

        const inAuth = segments[0] === '(auth)';
        if (!isAuthenticated && !inAuth) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuth) {
            router.replace('/(app)');
        }
    }, [isAuthenticated, loading, isFirstRun]);

    return null;
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <ConfigProvider>
                    <MemberProvider>
                        <StatusBar style="light" />
                        <AuthGate />
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(auth)/login" />
                            <Stack.Screen name="(auth)/setup" />
                            <Stack.Screen name="(app)" />
                        </Stack>
                    </MemberProvider>
                </ConfigProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
