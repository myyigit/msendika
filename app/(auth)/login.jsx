import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const { login, error, setError } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) return;
        setLoading(true);
        const ok = await login(username, password);
        if (ok) {
            router.replace('/(app)');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.card}>
                {/* Logo */}
                <View style={styles.logoWrap}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoIcon}>🛡️</Text>
                    </View>
                    <Text style={styles.appName}>YGT Tech</Text>
                    <Text style={styles.appSub}>Sendika Takip Sistemi</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputWrap}>
                        <Text style={styles.inputIcon}>👤</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Kullanıcı adı"
                            placeholderTextColor="#6b7280"
                            value={username}
                            onChangeText={(v) => { setUsername(v); setError(''); }}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputWrap}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Parola"
                            placeholderTextColor="#6b7280"
                            value={password}
                            onChangeText={(v) => { setPassword(v); setError(''); }}
                            secureTextEntry={!showPass}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                            <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    {!!error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.btn, (!username || !password) && styles.btnDisabled]}
                        onPress={handleLogin}
                        disabled={loading || !username || !password}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.btnText}>Giriş Yap</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030712',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 32,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    logoWrap: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: '#1d4ed8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    logoIcon: {
        fontSize: 34,
    },
    appName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
    },
    appSub: {
        color: '#6b7280',
        fontSize: 13,
        marginTop: 4,
    },
    form: {
        gap: 12,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f2937',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#374151',
        paddingHorizontal: 14,
        paddingVertical: 2,
    },
    inputIcon: {
        fontSize: 16,
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        paddingVertical: 14,
    },
    eyeBtn: {
        padding: 6,
    },
    eyeText: {
        fontSize: 18,
    },
    errorBox: {
        backgroundColor: '#450a0a',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#7f1d1d',
        padding: 12,
        alignItems: 'center',
    },
    errorText: {
        color: '#fca5a5',
        fontSize: 13,
        fontWeight: '500',
    },
    btn: {
        backgroundColor: '#2563eb',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    btnDisabled: {
        opacity: 0.5,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
