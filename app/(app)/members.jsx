import { useState, useMemo } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    StyleSheet, Pressable,
} from 'react-native';
import { useMembers } from '../../context/MemberContext';
import { useRouter } from 'expo-router';

const DURUMLAR = ['hepsi', 'aktif', 'pasif', 'emekli'];

function durumColor(durum) {
    if (durum === 'aktif') return { bg: '#052e16', text: '#10b981' };
    if (durum === 'pasif') return { bg: '#450a0a', text: '#ef4444' };
    return { bg: '#451a03', text: '#f59e0b' };
}

export default function MembersScreen() {
    const { members } = useMembers();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [durum, setDurum] = useState('hepsi');

    const filtered = useMemo(() => {
        let list = [...members];
        if (durum !== 'hepsi') list = list.filter((m) => m.uyelikDurumu === durum);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (m) =>
                    m.ad.toLowerCase().includes(q) ||
                    m.soyad.toLowerCase().includes(q) ||
                    m.sicilNo.toLowerCase().includes(q) ||
                    m.meslek.toLowerCase().includes(q) ||
                    m.departman.toLowerCase().includes(q)
            );
        }
        return list.sort((a, b) =>
            `${a.ad} ${a.soyad}`.localeCompare(`${b.ad} ${b.soyad}`, 'tr')
        );
    }, [members, durum, search]);

    const renderItem = ({ item: m }) => {
        const dc = durumColor(m.uyelikDurumu);
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/(app)/member/${m.id}`)}
                activeOpacity={0.8}
            >
                <View style={styles.cardLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{m.ad[0]}{m.soyad[0]}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.name}>{m.ad} {m.soyad}</Text>
                        <Text style={styles.role}>{m.meslek}</Text>
                        <Text style={styles.detail}>{m.sicilNo} · {m.departman}</Text>
                    </View>
                </View>
                <View>
                    <View style={[styles.badge, { backgroundColor: dc.bg }]}>
                        <Text style={[styles.badgeText, { color: dc.text }]}>{m.uyelikDurumu}</Text>
                    </View>
                    <Text style={styles.dateText}>{new Date(m.uyelikTarihi).toLocaleDateString('tr-TR')}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Search */}
            <View style={styles.searchWrap}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Ad, sicil no, meslek ara..."
                    placeholderTextColor="#4b5563"
                    value={search}
                    onChangeText={setSearch}
                    autoCorrect={false}
                />
                {!!search && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Text style={styles.clearIcon}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <View style={styles.filters}>
                {DURUMLAR.map((d) => (
                    <Pressable
                        key={d}
                        style={[styles.filterBtn, durum === d && styles.filterBtnActive]}
                        onPress={() => setDurum(d)}
                    >
                        <Text style={[styles.filterText, durum === d && styles.filterTextActive]}>
                            {d === 'hepsi' ? 'Tümü' : d.charAt(0).toUpperCase() + d.slice(1)}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Count */}
            <Text style={styles.countText}>{filtered.length} üye</Text>

            <FlatList
                data={filtered}
                keyExtractor={(m) => String(m.id)}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyText}>Üye bulunamadı</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1f2937',
        margin: 12,
        marginBottom: 8,
        paddingHorizontal: 14,
    },
    searchIcon: { fontSize: 16, marginRight: 10 },
    searchInput: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 12 },
    clearIcon: { color: '#6b7280', fontSize: 16, padding: 4 },
    filters: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
    filterBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    filterBtnActive: { backgroundColor: '#1d4ed8', borderColor: '#3b82f6' },
    filterText: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },
    filterTextActive: { color: '#fff' },
    countText: { color: '#6b7280', fontSize: 12, paddingHorizontal: 16, marginBottom: 4 },
    list: { paddingHorizontal: 12, paddingBottom: 24 },
    card: {
        backgroundColor: '#111827',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        padding: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#1d4ed8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    cardInfo: { flex: 1 },
    name: { color: '#fff', fontSize: 15, fontWeight: '700' },
    role: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
    detail: { color: '#4b5563', fontSize: 11, marginTop: 3 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-end' },
    badgeText: { fontSize: 11, fontWeight: '700' },
    dateText: { color: '#4b5563', fontSize: 10, marginTop: 4, textAlign: 'right' },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: { fontSize: 40, marginBottom: 12 },
    emptyText: { color: '#6b7280', fontSize: 15 },
});
