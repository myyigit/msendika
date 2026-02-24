import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

    const deptStats = members.reduce((acc, m) => {
        acc[m.departman] = (acc[m.departman] || 0) + 1;
        return acc;
    }, {});

    const topDepts = Object.entries(deptStats).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.welcome}>Hoş geldiniz 👋</Text>
            <Text style={styles.sub}>Sendika üyelik özeti</Text>

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

            {/* Dept Stats */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📈 Departman Dağılımı</Text>
                {topDepts.map(([dep, count]) => {
                    const pct = Math.round((count / stats.toplam) * 100);
                    return (
                        <View key={dep} style={styles.depRow}>
                            <View style={styles.depHeader}>
                                <Text style={styles.depName}>{dep}</Text>
                                <Text style={styles.depCount}>{count} üye</Text>
                            </View>
                            <View style={styles.bar}>
                                <View style={[styles.barFill, { width: `${pct}%` }]} />
                            </View>
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
    depRow: { marginBottom: 12 },
    depHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    depName: { color: '#d1d5db', fontSize: 13 },
    depCount: { color: '#6b7280', fontSize: 12 },
    bar: { height: 6, backgroundColor: '#1f2937', borderRadius: 4, overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
});
