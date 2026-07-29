import { createContext, type ReactNode, useState, useEffect, useRef } from "react";
import type { Track } from "../../../types/track.ts";
import { useAuth } from "../../../context/AuthContext.tsx";
import { supabase } from "../../../lib/supabaseClient.ts";
import { useListeningStats } from "../../personalActivity/hooks/useListeningStats.ts";
interface FavoritesContextType {
    favorites: Track[];
    addFavorite: (track: Track) => Promise<void>;
    removeFavorite: (id: number | string) => Promise<void>;
    isFavorite: (id: number | string) => boolean;
}
export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useAuth();
    const [favorites, setFavorites] = useState<Track[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);
    const { logTrackInteraction } = useListeningStats();
    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);
    useEffect(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;
        const fetchFavorites = async () => {
            if (!session) {
                if (isMountedRef.current) setFavorites([]);
                return;
            }
            try {
                console.log("Fetching favorites for user:", session.user.id);
                const { data, error } = await supabase
                    .from("favorites")
                    .select("track, created_at")
                    .eq("user_id", session.user.id)
                    .order("created_at", { ascending: false });
                if (signal.aborted) return;
                if (error) {
                    console.error("Error fetching favorites:", error.message);
                    return;
                }
                if (!data || data.length === 0) {
                    if (isMountedRef.current) setFavorites([]);
                    return;
                }
                const parsedTracks = data
                    .map((item) => {
                        try {
                            const track = typeof item.track === "string"
                                ? JSON.parse(item.track)
                                : item.track;
                            return { ...track, id: Number(track.id) };
                        } catch (e) {
                            console.error("Error parsing track:", e);
                            return null;
                        }
                    })
                    .filter((track): track is Track => track !== null);
                console.log("Loaded track IDs:", parsedTracks.map(t => t.id));
                console.log(`Loaded ${parsedTracks.length} favorites`);
                if (isMountedRef.current && !signal.aborted) {
                    setFavorites(parsedTracks);
                }
            } catch (error) {
                if (signal.aborted) return;
                console.error("Unexpected error in fetchFavorites:", error);
            }
        };
        fetchFavorites();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [session?.user.id]);
    const addFavorite = async (track: Track) => {
        if (!session) {
            alert("Please log in to add favorites");
            return;
        }
        if (favorites.some((t) => t.id === track.id)) {
            console.log("Track already in favorites");
            return;
        }
        const { error } = await supabase.from("favorites").insert({
            user_id: session.user.id,
            track_id: Number(track.id),
            track: track,
        });
        if (error) {
            console.error("Error adding favorite:", error.message);
            alert("Failed to add favorite. Please try again.");
            return;
        }
        await logTrackInteraction({
            trackId: Number(track.id),
            artistId: typeof track.artist === "object" && track.artist?.id
                ? Number(track.artist.id)
                : undefined,
            action: "favorite",
        });
        if (isMountedRef.current) {
            setFavorites((prev) => {
                const exists = prev.some(t => t.id === track.id);
                return exists ? prev : [...prev, track];
            });
        }
        console.log("Favorite added successfully");
    };
    const removeFavorite = async (id: number | string) => {
        if (!session) return;
        const trackExists = favorites.some((t) => t.id === id);
        if (!trackExists) return;
        if (isMountedRef.current) {
            setFavorites((prev) => prev.filter((t) => t.id !== id));
        }
        const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", session.user.id)
            .eq("track_id", Number(id));
        if (error) {
            console.error("Error removing favorite:", error.message);
            const track = favorites.find((t) => t.id === id);
            if (track && isMountedRef.current) {
                setFavorites((prev) => [...prev, track]);
            }
            alert("Failed to remove favorite. Please try again.");
        }
    };
    const isFavorite = (id: number | string) => {
        return favorites.some((t) => t.id === id);
    };
    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};