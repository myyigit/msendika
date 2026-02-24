import { createContext, useContext, useState } from 'react';
import { mockMembers } from '../data/mockData';

const MemberContext = createContext(null);

export function MemberProvider({ children }) {
    const [members, setMembers] = useState(mockMembers);

    const addMember = (data) => {
        const newMember = {
            ...data,
            id: Date.now(),
            sicilNo: `SGK-${String(members.length + 1).padStart(3, '0')}`,
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

    const stats = {
        toplam: members.length,
        aktif: members.filter((m) => m.uyelikDurumu === 'aktif').length,
        pasif: members.filter((m) => m.uyelikDurumu === 'pasif').length,
        emekli: members.filter((m) => m.uyelikDurumu === 'emekli').length,
    };

    return (
        <MemberContext.Provider value={{ members, addMember, updateMember, deleteMember, getMember, stats }}>
            {children}
        </MemberContext.Provider>
    );
}

export function useMembers() {
    return useContext(MemberContext);
}
