import { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useMembers } from '../../context/MemberContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

function Section({ title, children }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

export default function SettingsScreen() {
    const { changeCredentials, getUsername, logout } = useAuth();
    const { exportBackup, importBackup, stats } = useMembers();

    const [username, setUsername] = useState('');
    const [currentPass, setCurrentPass] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newPass2, setNewPass2] = useState('');
    const [showPasses, setShowPasses] = useState(false);
    const [credSaving, setCredSaving] = useState(false);
    const [backupBusy, setBackupBusy] = useState(false);

    useEffect(() => {
        getUsername().then(setUsername);
    }, []);

    const handleChangeCredentials = async () => {
        if (!currentPass) return Alert.alert('Hata', 'Mevcut parolayı girin.');
        if (!newUsername.trim() || newUsername.trim().length < 3)
            return Alert.alert('Hata', 'Yeni kullanıcı adı en az 3 karakter olmalı.');
        if (newPass.length < 6) return Alert.alert('Hata', 'Yeni parola en az 6 karakter olmalı.');
        if (newPass !== newPass2) return Alert.alert('Hata', 'Yeni parolalar eşleşmiyor.');

        setCredSaving(true);
        const result = await changeCredentials(currentPass, newUsername.trim(), newPass);
        setCredSaving(false);

        if (result.ok) {
            setUsername(newUsername.trim());
            setCurrentPass(''); setNewUsername(''); setNewPass(''); setNewPass2('');
            Alert.alert('✅ Başarılı', 'Kimlik bilgileri güncellendi.');
        } else {
            Alert.alert('Hata', result.error);
        }
    };

    const handleExport = async () => {
        setBackupBusy(true);
        try {
            const jsonStr = exportBackup();
            const filename = `sendika-yedek-${new Date().toISOString().slice(0, 10)}.json`;
            const fileUri = FileSystem.documentDirectory + filename;
            await FileSystem.writeAsStringAsync(fileUri, jsonStr);
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Yedeği Paylaş' });
            } else {
                Alert.alert('Yedek Alındı', `Dosya konumu:\n${fileUri}`);
            }
        } catch (e) {
            Alert.alert('Hata', 'Yedek alınamadı: ' + e.message);
        }
        setBackupBusy(false);
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });
            if (result.canceled || !result.assets?.length) return;

            const file = result.assets[0];
            const content = await FileSystem.readAsStringAsync(file.uri);

            Alert.alert(
                '⚠️ Geri Yükleme',
                'Mevcut tüm veriler silinip yedekten yüklenecek. Emin misiniz?',
                [
                    { text: 'İptal', style: 'cancel' },
                    {
                        text: 'Geri Yükle',
                        style: 'destructive',
                        onPress: async () => {
                            setBackupBusy(true);
                            const res = await importBackup(content);
                            setBackupBusy(false);
                            if (res.ok) {
                                Alert.alert('✅ Başarılı', `${res.count} üye geri yüklendi.`);
                            } else {
                                Alert.alert('Hata', res.error);
                            }
                        },
                    },
                ]
            );
        } catch (e) {
            Alert.alert('Hata', 'Dosya açılamadı: ' + e.message);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Mevcut Kullanıcı */}
            <View style={styles.userCard}>
                <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{username ? username[0].toUpperCase() : '?'}</Text>
                </View>
                <View>
                    <Text style={styles.userLabel}>Aktif Kullanıcı</Text>
                    <Text style={styles.userNameText}>{username || '—'}</Text>
                </View>
            </View>

            {/* Kimlik Bilgileri */}
            <Section title="🔐 Kimlik Bilgileri">
                <Text style={styles.fieldLabel}>Mevcut Parola</Text>
                <View style={styles.inputWrap}>
                    <TextInput
                        style={styles.input}
                        placeholder="Mevcut parolanızı girin"
                        placeholderTextColor="#4b5563"
                        value={currentPass}
                        onChangeText={setCurrentPass}
                        secureTextEntry={!showPasses}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPasses(v => !v)} style={styles.eyeBtn}>
                        <Text>{showPasses ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Yeni Kullanıcı Adı</Text>
                <TextInput
                    style={styles.inputPlain}
                    placeholder="Yeni kullanıcı adı"
                    placeholderTextColor="#4b5563"
                    value={newUsername}
                    onChangeText={setNewUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <Text style={styles.fieldLabel}>Yeni Parola</Text>
                <TextInput
                    style={styles.inputPlain}
                    placeholder="Yeni parola (min. 6 karakter)"
                    placeholderTextColor="#4b5563"
                    value={newPass}
                    onChangeText={setNewPass}
                    secureTextEntry={!showPasses}
                    autoCapitalize="none"
                />

                <Text style={styles.fieldLabel}>Yeni Parola (Tekrar)</Text>
                <TextInput
                    style={styles.inputPlain}
                    placeholder="Parolayı tekrar girin"
                    placeholderTextColor="#4b5563"
                    value={newPass2}
                    onChangeText={setNewPass2}
                    secureTextEntry={!showPasses}
                    autoCapitalize="none"
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleChangeCredentials} disabled={credSaving}>
                    {credSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>💾 Güncelle</Text>}
                </TouchableOpacity>
            </Section>

            {/* Yedekleme */}
            <Section title="📦 Veri Yedekleme">
                <Text style={styles.backupInfo}>
                    {stats.toplam} üye kaydınız mevcut. Yedeği JSON dosyası olarak dışa aktarabilir, başka bir cihazda geri yükleyebilirsiniz.
                </Text>

                <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={backupBusy}>
                    {backupBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.exportBtnText}>📤 Yedek Al</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.importBtn} onPress={handleImport} disabled={backupBusy}>
                    <Text style={styles.importBtnText}>📥 Yedekten Geri Yükle</Text>
                </TouchableOpacity>
            </Section>

            {/* Oturumu Kapat */}
            <Section title="🚪 Oturum">
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => Alert.alert('Çıkış Yap', 'Oturumu kapatmak istiyor musunuz?', [
                        { text: 'İptal', style: 'cancel' },
                        { text: 'Çıkış', style: 'destructive', onPress: logout },
                    ])}
                >
                    <Text style={styles.logoutBtnText}>Oturumu Kapat</Text>
                </TouchableOpacity>
            </Section>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    content: { padding: 16, paddingBottom: 40 },
    userCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#111827', borderRadius: 16, borderWidth: 1,
        borderColor: '#1f2937', padding: 16, marginBottom: 12,
    },
    userAvatar: {
        width: 52, height: 52, borderRadius: 16, backgroundColor: '#1d4ed8',
        alignItems: 'center', justifyContent: 'center',
    },
    userAvatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
    userLabel: { color: '#6b7280', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    userNameText: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 2 },
    section: {
        backgroundColor: '#111827', borderRadius: 16, borderWidth: 1,
        borderColor: '#1f2937', padding: 16, marginBottom: 12,
    },
    sectionTitle: { color: '#e5e7eb', fontSize: 15, fontWeight: '700', marginBottom: 14 },
    fieldLabel: { color: '#9ca3af', fontSize: 12, marginBottom: 6, marginTop: 10 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2937',
        borderRadius: 12, borderWidth: 1, borderColor: '#374151',
        paddingHorizontal: 12,
    },
    input: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 12 },
    inputPlain: {
        backgroundColor: '#1f2937', borderRadius: 12, borderWidth: 1,
        borderColor: '#374151', color: '#fff', fontSize: 14,
        paddingHorizontal: 12, paddingVertical: 12,
    },
    eyeBtn: { padding: 8 },
    saveBtn: {
        backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 13,
        alignItems: 'center', marginTop: 16,
    },
    saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    backupInfo: { color: '#9ca3af', fontSize: 13, lineHeight: 20, marginBottom: 14 },
    exportBtn: {
        backgroundColor: '#065f46', borderRadius: 12, paddingVertical: 13,
        alignItems: 'center', marginBottom: 10,
    },
    exportBtnText: { color: '#10b981', fontSize: 14, fontWeight: '700' },
    importBtn: {
        backgroundColor: '#1f2937', borderRadius: 12, borderWidth: 1,
        borderColor: '#374151', paddingVertical: 13, alignItems: 'center',
    },
    importBtnText: { color: '#d1d5db', fontSize: 14, fontWeight: '600' },
    logoutBtn: {
        backgroundColor: '#1a0505', borderRadius: 12, borderWidth: 1,
        borderColor: '#310b0b', paddingVertical: 13, alignItems: 'center',
    },
    logoutBtnText: { color: '#f87171', fontSize: 14, fontWeight: '700' },
});
