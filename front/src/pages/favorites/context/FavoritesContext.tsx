import { createContext, type ReactNode, useState, useEffect } from "react";

import type { Track } from "../../../types/track.ts";
import { useAuth } from "../../../context/AuthContext.tsx";
import {supabase} from "../../../lib/superbaseClient.ts";


interface FavoritesContextType {
    favorites: Track[];
    addFavorite: (track: Track) => void;
    removeFavorite: (id: number | string) => void;
    isFavorite: (id: number | string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useAuth();
    const [favorites, setFavorites] = useState<Track[]>([]);

    // Завантаження фаворитів з Supabase + localStorage
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!session) {
                setFavorites([]);
                return;
            }

            // Спробуємо спочатку завантажити з localStorage
            const saved = localStorage.getItem(`favorites_${session.user.id}`);
            if (saved) {
                setFavorites(JSON.parse(saved));
            }

            // Потім підтягнемо з Supabase
            const { data, error } = await supabase
                .from("favorites")
                .select("track")
                .eq("user_id", session.user.id);

            if (error) {
                console.log("Error fetching favorites:", error.message);
            } else if (data) {
                const supabaseFavorites = data.map((item: any) => item.track);
                setFavorites(supabaseFavorites);
                localStorage.setItem(`favorites_${session.user.id}`, JSON.stringify(supabaseFavorites));
            }
        };
        fetchFavorites();
    }, [session]);

    const addFavorite = async (track: Track) => {
        if (!session) {
            alert("Спочатку зареєструйтесь або увійдіть");
            return;
        }

        if (favorites.some(t => t.id === track.id)) return;

        const updated = [...favorites, track];
        setFavorites(updated);

        // Зберігаємо в localStorage
        localStorage.setItem(`favorites_${session.user.id}`, JSON.stringify(updated));

        // Зберігаємо в Supabase
        const { error } = await supabase
            .from("favorites")
            .upsert({ user_id: session.user.id, track_id: track.id, track });
        if (error) console.log("Error adding favorite:", error.message);
    };

    const removeFavorite = async (id: number | string) => {
        if (!session) return;

        const updated = favorites.filter((t) => t.id !== id);
        setFavorites(updated);

        // Оновлюємо localStorage
        localStorage.setItem(`favorites_${session.user.id}`, JSON.stringify(updated));

        // Видаляємо з Supabase
        const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", session.user.id)
            .eq("track_id", id);
        if (error) console.log("Error removing favorite:", error.message);
    };

    const isFavorite = (id: number | string) => favorites.some((t) => t.id === id);

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
