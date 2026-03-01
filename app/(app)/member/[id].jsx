import { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMembers } from '../../../context/MemberContext';

function InfoRow({ icon, label, value }) {
    if (!value) return null;
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
                <Text style={styles.infoIcon}>{icon}</Text>
            </View>
            <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

function durumCfg(durum) {
    if (durum === 'aktif') return { bg: '#052e16', text: '#10b981', icon: '✅' };
    if (durum === 'pasif') return { bg: '#450a0a', text: '#ef4444', icon: '❌' };
    return { bg: '#451a03', text: '#f59e0b', icon: '🏖️' };
}

const fmt = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : '-';

export default function MemberDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { getMember, deleteMember, updateMember } = useMembers();
    const member = getMember(id);

    if (!member) {
        return (
            <View style={styles.notFound}>
                <Text style={styles.notFoundIcon}>😕</Text>
                <Text style={styles.notFoundText}>Üye bulunamadı</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const cfg = durumCfg(member.uyelikDurumu);

    const toggleDurum = () => {
        if (member.uyelikDurumu === 'emekli') {
            Alert.alert(
                'Durum Değiştir',
                'Emekli üyeyi aktif yapmak istediğinize emin misiniz?',
                [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Aktif Yap', onPress: () => updateMember(member.id, { uyelikDurumu: 'aktif' }) },
                ]
            );
            return;
        }
        const next = member.uyelikDurumu === 'aktif' ? 'pasif' : 'aktif';
        updateMember(member.id, { uyelikDurumu: next });
    };

    const handleDelete = () => {
        Alert.alert('Üyeyi Sil', `${member.ad} ${member.soyad} silinsin mi?`, [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Sil', style: 'destructive',
                onPress: () => { deleteMember(member.id); router.replace('/(app)/members'); },
            },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.headerCard}>
                <View style={styles.avatarLg}>
                    <Text style={styles.avatarLgText}>{member.ad[0]}{member.soyad[0]}</Text>
                </View>
                <Text style={styles.fullName}>{member.ad} {member.soyad}</Text>
                <Text style={styles.roleText}>{member.meslek} · {member.departman}</Text>
                <View style={styles.badges}>
                    <View style={[styles.durumBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.durumBadgeText, { color: cfg.text }]}>{cfg.icon} {member.uyelikDurumu}</Text>
                    </View>
                    <View style={styles.sicilBadge}>
                        <Text style={styles.sicilText}>{member.sicilNo}</Text>
                    </View>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={toggleDurum} activeOpacity={0.8}>
                    <Text style={styles.actionBtnText}>🔄 Durum Değiştir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete} activeOpacity={0.8}>
                    <Text style={[styles.actionBtnText, { color: '#f87171' }]}>🗑️ Sil</Text>
                </TouchableOpacity>
            </View>

            {/* Contact */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>İletişim</Text>
                <InfoRow icon="📱" label="Telefon" value={member.telefon} />
                <InfoRow icon="📧" label="E-posta" value={member.email} />
                <InfoRow icon="📍" label="Adres" value={member.adres} />
            </View>

            {/* Work */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>İş Bilgileri</Text>
                <InfoRow icon="💼" label="Meslek" value={member.meslek} />
                <InfoRow icon="🏢" label="Departman" value={member.departman} />
                <InfoRow icon="💰" label="Maaş" value={member.maas ? `${Number(member.maas).toLocaleString('tr-TR')} ₺` : null} />
            </View>

            {/* Dates */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tarihler</Text>
                <InfoRow icon="🎂" label="Doğum Tarihi" value={fmt(member.dogumTarihi)} />
                <InfoRow icon="🗓️" label="İşe Giriş" value={fmt(member.iseGirisTarihi)} />
                <InfoRow icon="🤝" label="Üyelik Tarihi" value={fmt(member.uyelikTarihi)} />
            </View>

            {/* Identity */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kimlik</Text>
                <InfoRow icon="🪪" label="TC Kimlik" value={member.tcKimlik ? `${member.tcKimlik.slice(0, 3)}***${member.tcKimlik.slice(-3)}` : null} />
                <InfoRow icon="🔖" label="Sicil No" value={member.sicilNo} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    content: { padding: 16, paddingBottom: 40 },
    notFound: { flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center' },
    notFoundIcon: { fontSize: 48, marginBottom: 12 },
    notFoundText: { color: '#9ca3af', fontSize: 16 },
    backBtn: { marginTop: 16 },
    backBtnText: { color: '#60a5fa', fontSize: 14 },
    headerCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
        padding: 24,
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarLg: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#1d4ed8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarLgText: { color: '#fff', fontSize: 28, fontWeight: '800' },
    fullName: { color: '#fff', fontSize: 22, fontWeight: '800' },
    roleText: { color: '#9ca3af', fontSize: 13, marginTop: 4, textAlign: 'center' },
    badges: { flexDirection: 'row', gap: 8, marginTop: 12 },
    durumBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    durumBadgeText: { fontSize: 12, fontWeight: '700' },
    sicilBadge: { backgroundColor: '#1f2937', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    sicilText: { color: '#9ca3af', fontSize: 12 },
    actions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    actionBtn: {
        flex: 1,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1f2937',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    deleteBtn: { borderColor: '#310b0b', backgroundColor: '#1a0505' },
    actionBtnText: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
    section: {
        backgroundColor: '#111827',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        padding: 16,
        marginBottom: 10,
    },
    sectionTitle: { color: '#6b7280', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    infoIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#1f2937',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoIcon: { fontSize: 16 },
    infoTexts: { flex: 1 },
    infoLabel: { color: '#6b7280', fontSize: 11 },
    infoValue: { color: '#fff', fontSize: 14, fontWeight: '500', marginTop: 1 },
});
