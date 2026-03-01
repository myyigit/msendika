import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useConfig } from '../../context/ConfigContext';
import { useMembers } from '../../context/MemberContext';

const initForm = {
    ad: '', soyad: '', tcKimlik: '', dogumTarihi: '', kurum: '', meslek: '',
    departman: '', iseGirisTarihi: '', telefon: '', email: '', adres: '',
    maas: '', uyelikDurumu: 'aktif',
};

function Field({ label, required, error, children }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}{required && <Text style={{ color: '#ef4444' }}> *</Text>}</Text>
            {children}
            {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

function Input({ value, onChangeText, placeholder, keyboardType, secureTextEntry, multiline }) {
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#4b5563"
            keyboardType={keyboardType || 'default'}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            style={[styles.input, multiline && { minHeight: 70, textAlignVertical: 'top' }]}
            autoCapitalize="none"
            autoCorrect={false}
        />
    );
}

function Picker({ value, onSelect, options, placeholder }) {
    const [open, setOpen] = useState(false);
    return (
        <View>
            <TouchableOpacity style={styles.picker} onPress={() => setOpen((v) => !v)} activeOpacity={0.8}>
                <Text style={value ? styles.pickerValue : styles.pickerPlaceholder}>
                    {value || placeholder}
                </Text>
                <Text style={styles.pickerArrow}>{open ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {open && (
                <View style={styles.pickerDropdown}>
                    {options.map((opt) => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.pickerOption, value === opt && styles.pickerOptionActive]}
                            onPress={() => { onSelect(opt); setOpen(false); }}
                        >
                            <Text style={[styles.pickerOptionText, value === opt && { color: '#60a5fa' }]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

export default function AddMemberScreen() {
    const router = useRouter();
    const { addMember, stats } = useMembers();
    const { config } = useConfig();

    const [form, setForm] = useState(initForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const set = (field) => (val) => {
        setForm((p) => ({ ...p, [field]: val }));
        setErrors((p) => ({ ...p, [field]: '' }));
    };

    const validate = () => {
        const e = {};

        if (!form.ad.trim()) e.ad = 'Ad zorunlu';
        if (!form.soyad.trim()) e.soyad = 'Soyad zorunlu';
        if (!form.tcKimlik.trim()) e.tcKimlik = 'TC Kimlik zorunlu';
        else if (!/^\d{11}$/.test(form.tcKimlik)) e.tcKimlik = '11 haneli rakam olmalı';
        if (!form.kurum) e.kurum = 'Kurum seçin';
        if (!form.meslek) e.meslek = 'Meslek seçin';
        if (!form.departman) e.departman = 'Departman seçin';
        if (!form.iseGirisTarihi.trim()) e.iseGirisTarihi = 'İşe giriş tarihi zorunlu';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Geçerli e-posta girin';
        return e;
    };

    const handleSubmit = async () => {
        // Check Licensing
        const count = stats.toplam;
        const tier = config.license || 'free';

        if (tier === 'free' && count >= 10) {
            Alert.alert('Lisans Limiti', 'Ücretsiz sürüm limiti (Maks. 10 kayıt) doldu. Lütfen Ayarlar sayfasından "PRO" veya "SUPER" lisans kodunuzu girin.');
            return;
        }
        if (tier === 'pro' && count >= 25) {
            Alert.alert('Lisans Limiti', 'Pro sürüm limiti (Maks. 25 kayıt) doldu. Sınırsız kayıt için lütfen Ayarlar sayfasından "SUPER" lisans kodunuzu girin.');
            return;
        }

        const e = validate();
        if (Object.keys(e).length > 0) {
            setErrors(e);
            return;
        }
        setSaving(true);
        await new Promise((r) => setTimeout(r, 500));
        const newMember = addMember({ ...form, maas: form.maas ? Number(form.maas) : 0 });
        setSaving(false);
        setForm(initForm);
        Alert.alert('✅ Başarılı', `${newMember.ad} ${newMember.soyad} eklendi.`, [
            { text: 'Detaya Git', onPress: () => router.push(`/(app)/member/${newMember.id}`) },
            { text: 'Üye Listesi', onPress: () => router.push('/(app)/members') },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Kişisel */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Kişisel Bilgiler</Text>
                <Field label="Ad" required error={errors.ad}>
                    <Input value={form.ad} onChangeText={set('ad')} placeholder="Ahmet" />
                </Field>
                <Field label="Soyad" required error={errors.soyad}>
                    <Input value={form.soyad} onChangeText={set('soyad')} placeholder="Yılmaz" />
                </Field>
                <Field label="TC Kimlik No" required error={errors.tcKimlik}>
                    <Input value={form.tcKimlik} onChangeText={set('tcKimlik')} placeholder="12345678901" keyboardType="number-pad" />
                </Field>
                <Field label="Doğum Tarihi" error={errors.dogumTarihi}>
                    <Input value={form.dogumTarihi} onChangeText={set('dogumTarihi')} placeholder="1990-01-15" />
                </Field>
            </View>

            {/* İş */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💼 İş Bilgileri</Text>
                <Field label="Kurum" required error={errors.kurum}>
                    <Picker value={form.kurum} onSelect={set('kurum')} options={config.kurumlar} placeholder="Kurum seçin..." />
                </Field>
                <Field label="Meslek" required error={errors.meslek}>
                    <Picker value={form.meslek} onSelect={set('meslek')} options={config.meslekler} placeholder="Meslek seçin..." />
                </Field>
                <Field label="Departman" required error={errors.departman}>
                    <Picker value={form.departman} onSelect={set('departman')} options={config.departmanlar} placeholder="Departman seçin..." />
                </Field>
                <Field label="İşe Giriş Tarihi" required error={errors.iseGirisTarihi}>
                    <Input value={form.iseGirisTarihi} onChangeText={set('iseGirisTarihi')} placeholder="2020-01-01" />
                </Field>
                <Field label="Maaş (₺)" error={errors.maas}>
                    <Input value={form.maas} onChangeText={set('maas')} placeholder="15000" keyboardType="number-pad" />
                </Field>
                <Field label="Üyelik Durumu">
                    <Picker value={form.uyelikDurumu} onSelect={set('uyelikDurumu')} options={['aktif', 'pasif', 'emekli']} placeholder="Durum seçin..." />
                </Field>
            </View>

            {/* İletişim */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📞 İletişim</Text>
                <Field label="Telefon" error={errors.telefon}>
                    <Input value={form.telefon} onChangeText={set('telefon')} placeholder="0532 111 22 33" keyboardType="phone-pad" />
                </Field>
                <Field label="E-posta" error={errors.email}>
                    <Input value={form.email} onChangeText={set('email')} placeholder="ornek@mail.com" keyboardType="email-address" />
                </Field>
                <Field label="Adres" error={errors.adres}>
                    <Input value={form.adres} onChangeText={set('adres')} placeholder="Mahalle, Cadde, İlçe/Şehir" multiline />
                </Field>
            </View>

            {/* Butonlar */}
            <View style={styles.btnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                    <Text style={styles.cancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving} activeOpacity={0.8}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>➕ Üye Ekle</Text>}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    content: { padding: 16, paddingBottom: 40 },
    section: {
        backgroundColor: '#111827',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        padding: 16,
        marginBottom: 12,
    },
    sectionTitle: { color: '#e5e7eb', fontSize: 15, fontWeight: '700', marginBottom: 16 },
    field: { marginBottom: 14 },
    label: { color: '#9ca3af', fontSize: 13, marginBottom: 6 },
    input: {
        backgroundColor: '#1f2937',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151',
        color: '#fff',
        fontSize: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    errorText: { color: '#f87171', fontSize: 11, marginTop: 4 },
    picker: {
        backgroundColor: '#1f2937',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151',
        paddingHorizontal: 14,
        paddingVertical: 13,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerValue: { color: '#fff', fontSize: 14 },
    pickerPlaceholder: { color: '#4b5563', fontSize: 14 },
    pickerArrow: { color: '#6b7280', fontSize: 11 },
    pickerDropdown: {
        backgroundColor: '#1f2937',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151',
        marginTop: 4,
        maxHeight: 200,
        overflow: 'hidden',
    },
    pickerOption: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
    pickerOptionActive: { backgroundColor: '#1e3a5f' },
    pickerOptionText: { color: '#d1d5db', fontSize: 14 },
    btnRow: { flexDirection: 'row', gap: 10 },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#1f2937',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelText: { color: '#9ca3af', fontSize: 15, fontWeight: '600' },
    submitBtn: {
        flex: 2,
        backgroundColor: '#2563eb',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
