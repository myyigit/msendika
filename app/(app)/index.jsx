import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { useMembers } from '../../context/MemberContext';
import { useRouter } from 'expo-router';

function StatCard({ emoji, label, value, color, onPress }) {
    return (
        <TouchableOpacity style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 3 }]} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.statEmoji}>{emoji}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function durumRenk(durum) {
    if (durum === 'aktif') return '#10b981';
    if (durum === 'pasif') return '#ef4444';
    return '#f59e0b';
}

export default function DashboardScreen() {
    const { members, stats } = useMembers();
    const router = useRouter();

    const recent = [...members]
        .sort((a, b) => new Date(b.uyelikTarihi) - new Date(a.uyelikTarihi))
        .slice(0, 5);

    const [expandedKurum, setExpandedKurum] = useState(null);

    // Group members by Kurum -> Department logic
    const nestedStats = members.reduce((acc, m) => {
        const k = m.kurum || 'Belirtilmemiş';
        const d = m.departman || 'Belirtilmemiş';
        if (!acc[k]) acc[k] = { total: 0, depts: {} };
        acc[k].total += 1;
        acc[k].depts[d] = (acc[k].depts[d] || 0) + 1;
        return acc;
    }, {});

    const kurumList = Object.entries(nestedStats).sort((a, b) => b[1].total - a[1].total);

    const toggleKurum = (k) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedKurum(expandedKurum === k ? null : k);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.welcome}>Hoş geldiniz 👋</Text>
            <Text style={styles.sub}>Üyelik sistemi özeti</Text>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard emoji="👥" label="Toplam Üye" value={stats.toplam} color="#60a5fa" onPress={() => router.push('/(app)/members')} />
                <StatCard emoji="✅" label="Aktif Üye" value={stats.aktif} color="#10b981" onPress={() => router.push('/(app)/members')} />
                <StatCard emoji="❌" label="Pasif Üye" value={stats.pasif} color="#ef4444" onPress={() => router.push('/(app)/members')} />
                <StatCard emoji="🏖️" label="Emekli" value={stats.emekli} color="#f59e0b" onPress={() => router.push('/(app)/members')} />
            </View>

            {/* Recent */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📅 Son Katılan Üyeler</Text>
                {recent.map((m) => (
                    <TouchableOpacity
                        key={m.id}
                        style={styles.memberRow}
                        onPress={() => router.push(`/(app)/member/${m.id}`)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{m.ad[0]}{m.soyad[0]}</Text>
                        </View>
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{m.ad} {m.soyad}</Text>
                            <Text style={styles.memberRole}>{m.meslek}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: durumRenk(m.uyelikDurumu) + '20' }]}>
                            <Text style={[styles.badgeText, { color: durumRenk(m.uyelikDurumu) }]}>{m.uyelikDurumu}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Kurum Stats with Inner Dept Stats */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏢 Kurum & Departman Dağılımı</Text>
                {kurumList.length === 0 && <Text style={{ color: '#9ca3af', fontSize: 13 }}>Henüz veri yok.</Text>}
                {kurumList.map(([kr, data]) => {
                    const isExpanded = expandedKurum === kr;
                    const pct = stats.toplam > 0 ? Math.round((data.total / stats.toplam) * 100) : 0;
                    const sortedDepts = Object.entries(data.depts).sort((a, b) => b[1] - a[1]);

                    return (
                        <View key={kr} style={styles.depContainer}>
                            <TouchableOpacity
                                style={[styles.depRow, isExpanded && styles.depRowExpanded]}
                                onPress={() => toggleKurum(kr)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.depHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={{ color: '#9ca3af', fontSize: 12 }}>{isExpanded ? '▼' : '▶'}</Text>
                                        <Text style={styles.depName}>{kr}</Text>
                                    </View>
                                    <Text style={styles.depCount}>{data.total} üye</Text>
                                </View>
                                <View style={styles.bar}>
                                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: '#f59e0b' }]} />
                                </View>
                            </TouchableOpacity>

                            {/* Departman Listesi (Only visible if expanded) */}
                            {isExpanded && (
                                <View style={styles.innerDeptContainer}>
                                    {sortedDepts.map(([dep, count]) => {
                                        const depPct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
                                        return (
                                            <View key={dep} style={styles.innerDepRow}>
                                                <View style={styles.depHeader}>
                                                    <Text style={styles.innerDepName}>{dep}</Text>
                                                    <Text style={styles.innerDepCount}>{count}</Text>
                                                </View>
                                                <View style={styles.innerBar}>
                                                    <View style={[styles.innerBarFill, { width: `${depPct}%` }]} />
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    content: { padding: 16, paddingBottom: 32 },
    welcome: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 8 },
    sub: { color: '#6b7280', fontSize: 13, marginBottom: 20, marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
    statCard: {
        backgroundColor: '#111827',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        padding: 16,
        width: '47%',
        alignItems: 'flex-start',
    },
    statEmoji: { fontSize: 24, marginBottom: 8 },
    statValue: { fontSize: 32, fontWeight: '800', lineHeight: 36 },
    statLabel: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
    section: {
        backgroundColor: '#111827',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        padding: 16,
        marginTop: 12,
    },
    sectionTitle: { color: '#e5e7eb', fontSize: 15, fontWeight: '700', marginBottom: 12 },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#1d4ed8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    memberInfo: { flex: 1 },
    memberName: { color: '#fff', fontSize: 14, fontWeight: '600' },
    memberRole: { color: '#9ca3af', fontSize: 12, marginTop: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    depContainer: { marginBottom: 12 },
    depRow: { padding: 12, backgroundColor: '#1f2937', borderRadius: 10 },
    depRowExpanded: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    depHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    depName: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
    depCount: { color: '#6b7280', fontSize: 12 },
    bar: { height: 6, backgroundColor: '#374151', borderRadius: 4, overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
    innerDeptContainer: {
        backgroundColor: '#111827',
        borderWidth: 1, borderTopWidth: 0, borderColor: '#1f2937',
        borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
        padding: 12, paddingTop: 8
    },
    innerDepRow: { marginBottom: 10 },
    innerDepName: { color: '#9ca3af', fontSize: 12 },
    innerDepCount: { color: '#6b7280', fontSize: 11 },
    innerBar: { height: 4, backgroundColor: '#1f2937', borderRadius: 2, overflow: 'hidden' },
    innerBarFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 2 },
});
