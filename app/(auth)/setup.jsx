import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function SetupScreen() {
    const { setupCredentials } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSetup = async () => {
        setError('');
        if (!username.trim()) return setError('Kullanıcı adı boş olamaz.');
        if (username.trim().length < 3) return setError('Kullanıcı adı en az 3 karakter olmalı.');
        if (password.length < 6) return setError('Parola en az 6 karakter olmalı.');
        if (password !== password2) return setError('Parolalar eşleşmiyor.');
        setLoading(true);
        await setupCredentials(username.trim(), password);
        setLoading(false);
        router.replace('/(app)');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.card}>
                <View style={styles.logoWrap}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoIcon}>🛡️</Text>
                    </View>
                    <Text style={styles.appName}>YGT Tech</Text>
                    <Text style={styles.appSub}>İlk Kurulum</Text>
                </View>

                <Text style={styles.info}>
                    Giriş için kullanmak istediğiniz kullanıcı adı ve parolayı belirleyin.
                </Text>

                <View style={styles.form}>
                    <View style={styles.inputWrap}>
                        <Text style={styles.inputIcon}>👤</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Kullanıcı adı (min. 3 karakter)"
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
                            placeholder="Parola (min. 6 karakter)"
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

                    <View style={styles.inputWrap}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Parolayı tekrar girin"
                            placeholderTextColor="#6b7280"
                            value={password2}
                            onChangeText={(v) => { setPassword2(v); setError(''); }}
                            secureTextEntry={!showPass}
                            autoCapitalize="none"
                        />
                    </View>

                    {!!error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.btn, (!username || !password || !password2) && styles.btnDisabled]}
                        onPress={handleSetup}
                        disabled={loading || !username || !password || !password2}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.btnText}>✅ Kurulumu Tamamla</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712', justifyContent: 'center', padding: 24 },
    card: { backgroundColor: '#111827', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: '#1f2937' },
    logoWrap: { alignItems: 'center', marginBottom: 20 },
    logoCircle: {
        width: 72, height: 72, borderRadius: 20, backgroundColor: '#1d4ed8',
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    logoIcon: { fontSize: 34 },
    appName: { color: '#fff', fontSize: 22, fontWeight: '800' },
    appSub: { color: '#60a5fa', fontSize: 13, marginTop: 4, fontWeight: '600' },
    info: { color: '#9ca3af', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
    form: { gap: 12 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2937',
        borderRadius: 14, borderWidth: 1, borderColor: '#374151',
        paddingHorizontal: 14, paddingVertical: 2,
    },
    inputIcon: { fontSize: 16, marginRight: 10 },
    input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },
    eyeBtn: { padding: 6 },
    eyeText: { fontSize: 18 },
    errorBox: {
        backgroundColor: '#450a0a', borderRadius: 10, borderWidth: 1,
        borderColor: '#7f1d1d', padding: 12, alignItems: 'center',
    },
    errorText: { color: '#fca5a5', fontSize: 13, fontWeight: '500' },
    btn: { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
