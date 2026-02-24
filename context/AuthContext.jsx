import { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_USER = 'myyigit';
const AUTH_PASS = 'Sgk12345';
const SESSION_KEY = 'ygt_auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Uygulama açılışında oturum kontrolü
    const checkSession = async () => {
        try {
            const val = await AsyncStorage.getItem(SESSION_KEY);
            setIsAuthenticated(val === 'true');
        } catch (_) { }
        setLoading(false);
    };

    const login = async (username, password) => {
        if (username === AUTH_USER && password === AUTH_PASS) {
            await AsyncStorage.setItem(SESSION_KEY, 'true');
            setIsAuthenticated(true);
            setError('');
            return true;
        }
        setError('Kullanıcı adı veya parola hatalı.');
        return false;
    };

    const logout = async () => {
        await AsyncStorage.removeItem(SESSION_KEY);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, error, setError, loading, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
