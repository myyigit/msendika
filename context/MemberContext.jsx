import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockMembers } from '../data/mockData';

const MEMBERS_KEY = 'ygt_members';
const COUNTER_KEY = 'ygt_sicil_counter';

const MemberContext = createContext(null);

export function MemberProvider({ children }) {
    const [members, setMembers] = useState([]);
    const [membersLoaded, setMembersLoaded] = useState(false);
    const counterRef = useRef(null);

    // Başlangıçta AsyncStorage'dan üyeleri yükle
    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(MEMBERS_KEY);
                if (raw) {
                    setMembers(JSON.parse(raw));
                } else {
                    // İlk kullanım: mock verileri yükle ve kaydet
                    setMembers(mockMembers);
                    await AsyncStorage.setItem(MEMBERS_KEY, JSON.stringify(mockMembers));
                }
                // Sicil sayacını yükle
                const savedCounter = await AsyncStorage.getItem(COUNTER_KEY);
                if (savedCounter) {
                    counterRef.current = Number(savedCounter);
                } else {
                    const initCount = mockMembers.reduce((max, m) => (m.id > max ? m.id : max), 0);
                    counterRef.current = initCount;
                    await AsyncStorage.setItem(COUNTER_KEY, String(initCount));
                }
            } catch (_) {
                setMembers(mockMembers);
                counterRef.current = mockMembers.length;
            }
            setMembersLoaded(true);
        })();
    }, []);

    // Üyeler değiştiğinde AsyncStorage'a kaydet
    useEffect(() => {
        if (!membersLoaded) return;
        AsyncStorage.setItem(MEMBERS_KEY, JSON.stringify(members)).catch(() => { });
    }, [members, membersLoaded]);

    const addMember = (data) => {
        counterRef.current = (counterRef.current || 0) + 1;
        AsyncStorage.setItem(COUNTER_KEY, String(counterRef.current)).catch(() => { });
        const newMember = {
            ...data,
            id: Date.now(),
            sicilNo: String(counterRef.current).padStart(4, '0'), // SGK- kaldirildi
            uyelikTarihi: new Date().toISOString().split('T')[0],
        };
        setMembers((prev) => [...prev, newMember]);
        return newMember;
    };

    const updateMember = (id, data) => {
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    };

    const deleteMember = (id) => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
    };

    const getMember = (id) => members.find((m) => m.id === Number(id));

    // Yedek al: tüm üyeleri JSON string olarak döndür. Yeni versiyonda config de dahil ediliyor.
    const exportBackup = useCallback((systemConfig = {}) => {
        return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), members, config: systemConfig });
    }, [members]);

    // Yedekten geri yükle
    const importBackup = useCallback(async (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            if (!data.members || !Array.isArray(data.members)) {
                return { ok: false, error: 'Geçersiz yedek dosyası.' };
            }
            setMembers(data.members);
            await AsyncStorage.setItem(MEMBERS_KEY, JSON.stringify(data.members));
            // Sayacı güncelle
            const maxId = data.members.reduce((max, m) => (m.id > max ? m.id : max), 0);
            counterRef.current = maxId;
            await AsyncStorage.setItem(COUNTER_KEY, String(maxId));
            return { ok: true, count: data.members.length, config: data.config };
        } catch (_) {
            return { ok: false, error: 'Dosya okunamadı veya bozuk.' };
        }
    }, []);

    const stats = {
        toplam: members.length,
        aktif: members.filter((m) => m.uyelikDurumu === 'aktif').length,
        pasif: members.filter((m) => m.uyelikDurumu === 'pasif').length,
        emekli: members.filter((m) => m.uyelikDurumu === 'emekli').length,
    };

    return (
        <MemberContext.Provider value={{
            members, membersLoaded,
            addMember, updateMember, deleteMember, getMember,
            stats, exportBackup, importBackup,
        }}>
            {children}
        </MemberContext.Provider>
    );
}

export function useMembers() {
    return useContext(MemberContext);
}
