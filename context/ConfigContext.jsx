import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONFIG_KEY = 'ygt_config';

const defaultConfig = {
    kurumlar: ['Merkez', 'Şube 1', 'Şube 2'],
    departmanlar: ['Bilgi İşlem', 'Muhasebe', 'İnsan Kaynakları', 'Satış'],
    meslekler: ['Uzman', 'Mühendis', 'Yönetici', 'Personel'],
    license: 'free', // 'free', 'pro', 'super'
};

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
    const [config, setConfig] = useState(defaultConfig);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(CONFIG_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setConfig({ ...defaultConfig, ...parsed });
                } else {
                    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
                }
            } catch (error) {
                // Hata durumu
            } finally {
                setLoaded(true);
            }
        })();
    }, []);

    // Config degistikce kaydet
    useEffect(() => {
        if (!loaded) return;
        AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config)).catch(() => { });
    }, [config, loaded]);

    const addKurum = (k) => setConfig((prev) => ({ ...prev, kurumlar: [...new Set([...prev.kurumlar, k])] }));
    const removeKurum = (k) => setConfig((prev) => ({ ...prev, kurumlar: prev.kurumlar.filter(x => x !== k) }));

    const addDepartman = (d) => setConfig((prev) => ({ ...prev, departmanlar: [...new Set([...prev.departmanlar, d])] }));
    const removeDepartman = (d) => setConfig((prev) => ({ ...prev, departmanlar: prev.departmanlar.filter(x => x !== d) }));

    const addMeslek = (m) => setConfig((prev) => ({ ...prev, meslekler: [...new Set([...prev.meslekler, m])] }));
    const removeMeslek = (m) => setConfig((prev) => ({ ...prev, meslekler: prev.meslekler.filter(x => x !== m) }));

    const mergeConfig = (importedConfig) => {
        if (!importedConfig) return;
        setConfig((prev) => ({
            ...prev,
            kurumlar: [...new Set([...prev.kurumlar, ...(importedConfig.kurumlar || [])])],
            departmanlar: [...new Set([...prev.departmanlar, ...(importedConfig.departmanlar || [])])],
            meslekler: [...new Set([...prev.meslekler, ...(importedConfig.meslekler || [])])],
        }));
    };

    const updateLicense = (type) => {
        setConfig((prev) => ({ ...prev, license: type }));
    };

    return (
        <ConfigContext.Provider value={{
            config, loaded,
            addKurum, removeKurum,
            addDepartman, removeDepartman,
            addMeslek, removeMeslek,
            mergeConfig, updateLicense
        }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    return useContext(ConfigContext);
}
