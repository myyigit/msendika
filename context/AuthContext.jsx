import { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CREDS_KEY = 'ygt_credentials';  // { username, password }
const SESSION_KEY = 'ygt_auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFirstRun, setIsFirstRun] = useState(false);

    // Uygulama açılışında oturum + credentials kontrolü
    const checkSession = useCallback(async () => {
        try {
            const creds = await AsyncStorage.getItem(CREDS_KEY);
            if (!creds) {
                // Hiç kurulum yapılmamış — ilk kullanım
                setIsFirstRun(true);
                setLoading(false);
                return;
            }
            const val = await AsyncStorage.getItem(SESSION_KEY);
            setIsAuthenticated(val === 'true');
        } catch (_) { }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const raw = await AsyncStorage.getItem(CREDS_KEY);
            const creds = raw ? JSON.parse(raw) : null;
            if (creds && username === creds.username && password === creds.password) {
                await AsyncStorage.setItem(SESSION_KEY, 'true');
                setIsAuthenticated(true);
                setError('');
                return true;
            }
        } catch (_) { }
        setError('Kullanıcı adı veya parola hatalı.');
        return false;
    };

    // İlk kurulum: kullanıcı adı + parola oluştur
    const setupCredentials = async (username, password) => {
        await AsyncStorage.setItem(CREDS_KEY, JSON.stringify({ username, password }));
        await AsyncStorage.setItem(SESSION_KEY, 'true');
        setIsFirstRun(false);
        setIsAuthenticated(true);
    };

    // Ayarlar: kullanıcı adı + parola değiştir
    const changeCredentials = async (currentPassword, newUsername, newPassword) => {
        try {
            const raw = await AsyncStorage.getItem(CREDS_KEY);
            const creds = raw ? JSON.parse(raw) : null;
            if (!creds || creds.password !== currentPassword) {
                return { ok: false, error: 'Mevcut parola hatalı.' };
            }
            await AsyncStorage.setItem(CREDS_KEY, JSON.stringify({ username: newUsername, password: newPassword }));
            return { ok: true };
        } catch (_) {
            return { ok: false, error: 'Bir hata oluştu.' };
        }
    };

    // Mevcut kullanıcı adını oku
    const getUsername = async () => {
        try {
            const raw = await AsyncStorage.getItem(CREDS_KEY);
            const creds = raw ? JSON.parse(raw) : null;
            return creds?.username || '';
        } catch (_) { return ''; }
    };

    const logout = async () => {
        await AsyncStorage.removeItem(SESSION_KEY);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated, login, logout, error, setError,
            loading, checkSession, isFirstRun,
            setupCredentials, changeCredentials, getUsername,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
