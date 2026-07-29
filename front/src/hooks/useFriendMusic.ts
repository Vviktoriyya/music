import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.ts";
import { useAuth } from "../context/AuthContext.tsx";
import type { Profile } from "./useProfile.ts";
export interface ArtistCount {
    name: string;
    count: number;
}
export interface FriendMusicData {
    profile: Profile | null;
    topArtists: ArtistCount[];
    favoriteCount: number;
    playlistCount: number;
    compatibility: number;
    commonArtists: string[];
}
function extractArtists(favorites: any[]): Map<string, number> {
    const map = new Map<string, number>();
    favorites.forEach((row) => {
        const track = row.track || row;
        const artistName =
            typeof track.artist === "string"
                ? track.artist
                : track.artist?.name || "Unknown";
        map.set(artistName, (map.get(artistName) || 0) + 1);
    });
    return map;
}
export function useFriendMusic(friendId: string | undefined) {
    const { session } = useAuth();
    const [data, setData] = useState<FriendMusicData | null>(null);
    const [loading, setLoading] = useState(true);
    const fetchData = useCallback(async (): Promise<void> => {
        if (!friendId || !session?.user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            console.log("🔍 Fetching data for friend:", friendId);
            console.log("👤 My user id:", session.user.id);
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", friendId)
                .single();
            console.log("📝 Profile:", profileData, "Error:", profileError);
            const { data: friendFavorites, error: ffError } = await supabase
                .from("favorites")
                .select("track")
                .eq("user_id", friendId);
            console.log("🎵 Friend favorites count:", friendFavorites?.length, "Error:", ffError);
            console.log("🎵 Friend favorites:", friendFavorites);
            const { count: playlistCount } = await supabase
                .from("playlists")
                .select("*", { count: "exact", head: true })
                .eq("user_id", friendId);
            const { data: myFavorites, error: myFavError } = await supabase
                .from("favorites")
                .select("track")
                .eq("user_id", session.user.id);
            console.log("⭐ My favorites count:", myFavorites?.length, "Error:", myFavError);
            console.log("⭐ My favorites:", myFavorites);
            const friendArtistsMap = extractArtists(friendFavorites || []);
            const myArtistsMap = extractArtists(myFavorites || []);
            console.log("🎤 Friend artists:", Array.from(friendArtistsMap.entries()));
            console.log("🎤 My artists:", Array.from(myArtistsMap.entries()));
            const topArtists: ArtistCount[] = Array.from(friendArtistsMap.entries())
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            const friendArtistSet = new Set(friendArtistsMap.keys());
            const myArtistSet = new Set(myArtistsMap.keys());
            const commonArtists: string[] = [];
            friendArtistSet.forEach((artist) => {
                if (myArtistSet.has(artist)) {
                    commonArtists.push(artist);
                }
            });
            const union = new Set([...friendArtistSet, ...myArtistSet]);
            const compatibility =
                union.size > 0
                    ? Math.round((commonArtists.length / union.size) * 100)
                    : 0;
            console.log("🤝 Common artists:", commonArtists);
            console.log("📊 Union size:", union.size, "Common:", commonArtists.length);
            console.log("💯 Compatibility:", compatibility + "%");
            setData({
                profile: profileData as Profile,
                topArtists,
                favoriteCount: (friendFavorites || []).length,
                playlistCount: playlistCount || 0,
                compatibility,
                commonArtists,
            });
        } catch (err) {
            console.error("❌ Error:", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [friendId, session?.user?.id]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return { data, loading, refetch: fetchData };
}