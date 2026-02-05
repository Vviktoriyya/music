import { createContext, type ReactNode, useState, useEffect } from "react";
import type { Track } from "../../../types/track.ts";
import { useAuth } from "../../../context/AuthContext.tsx";
import { supabase } from "../../../lib/supabaseClient.ts";

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

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!session) {
                setFavorites([]);
                return;
            }

            const { data, error } = await supabase
                .from("favorites")
                .select("track");

            if (error) {
                console.error("Error fetching favorites:", error.message);
                return;
            }

            const parsedTracks = data?.map((item) =>
                typeof item.track === "string" ? JSON.parse(item.track) : item.track
            ) as Track[];

            setFavorites(parsedTracks || []);
        };

        fetchFavorites();
    }, [session]);

    const addFavorite = async (track: Track) => {
        if (!session) {
            alert("Please log in to add favorites ");
            return;
        }

        if (favorites.some((t) => t.id === track.id)) return;

        const updated = [...favorites, track];
        setFavorites(updated);

        const { error } = await supabase.from("favorites").insert({
            user_id: session.user.id,
            track_id: track.id,
            track: JSON.stringify(track),
        });

        if (error) {
            console.error("Error adding favorite:", error.message);
        }
    };

    const removeFavorite = async (id: number | string) => {
        if (!session) return;

        const updated = favorites.filter((t) => t.id !== id);
        setFavorites(updated);

        const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", session.user.id)
            .eq("track_id", id);

        if (error) {
            console.error("Error removing favorite:", error.message);
        }
    };

    const isFavorite = (id: number | string) => favorites.some((t) => t.id === id);

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
