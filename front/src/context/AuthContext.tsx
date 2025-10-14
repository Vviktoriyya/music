import {
    createContext,
    useState,
    useEffect,
    useContext,
    type ReactNode,
} from 'react';

import type { Session } from '@supabase/supabase-js';
import {supabase} from "../lib/superbaseClient.ts";

interface AuthContextType {
    session: Session | null;
    setSession: (session: Session | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        // отримуємо поточну сесію
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });

        // слухаємо зміни сесії (login/logout)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, setSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
