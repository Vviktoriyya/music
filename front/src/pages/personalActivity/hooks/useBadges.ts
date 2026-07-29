import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext.tsx";
import { supabase } from "../../../lib/supabaseClient.ts";
export interface Badge {
    id: string;
    label: string;
    description: string;
    icon: string;
    color: string;
    earned: boolean;
    earned_at?: string;
}
export const BADGE_DEFINITIONS: Omit<Badge, "earned" | "earned_at">[] = [
    {
        id: "meloman",
        label: "Melomaniac",
        description: "Listened to 50+ unique tracks",
        icon: "🎵",
        color: "from-[#EE10B0] to-purple-600",
    },
    {
        id: "explorer",
        label: "Explorer",
        description: "Added tracks from 10+ different artists",
        icon: "🧭",
        color: "from-green-400 to-teal-600",
    },
    {
        id: "collector",
        label: "Collector",
        description: "Added 20+ tracks to favorites",
        icon: "❤️",
        color: "from-red-500 to-pink-600",
    },
    {
        id: "dj",
        label: "DJ",
        description: "Added 30+ tracks to playlists",
        icon: "🎧",
        color: "from-yellow-400 to-orange-500",
    },
    {
        id: "addict",
        label: "Music Addict",
        description: "Made 200+ interactions with tracks",
        icon: "🔥",
        color: "from-orange-500 to-red-600",
    },
    {
        id: "first_steps",
        label: "First Steps",
        description: "Added the first track to favorites",
        icon: "🌟",
        color: "from-blue-400 to-cyan-500",
    },
    {
        id: "playlist_maker",
        label: "Playlist Maker",
        description: "Created your first playlist",
        icon: "📝",
        color: "from-purple-400 to-indigo-600",
    },
    {
        id: "social",
        label: "Social",
        description: "Added your first friend",
        icon: "🤝",
        color: "from-pink-400 to-rose-600",
    },
];
export const useBadges = () => {
    const { session } = useAuth();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [newBadge, setNewBadge] = useState<Badge | null>(null);
    const [loading, setLoading] = useState(false);
    const fetchEarnedBadges = useCallback(async () => {
        if (!session) return [];
        const { data, error } = await supabase
            .from("user_badges")
            .select("*")
            .eq("user_id", session.user.id);
        if (error) {
            console.error("Error fetching badges:", error);
            return [];
        }
        return data || [];
    }, [session?.user?.id]);
    const loadBadges = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        const earned = await fetchEarnedBadges();
        const earnedIds = earned.map((b: any) => b.badge_id);
        const allBadges: Badge[] = BADGE_DEFINITIONS.map((def) => {
            const earnedRecord = earned.find((b: any) => b.badge_id === def.id);
            return {
                ...def,
                earned: earnedIds.includes(def.id),
                earned_at: earnedRecord?.earned_at,
            };
        });
        setBadges(allBadges);
        setLoading(false);
    }, [session?.user?.id, fetchEarnedBadges]);
    useEffect(() => {
        loadBadges();
    }, [loadBadges]);
    const awardBadge = async (badgeId: string) => {
        if (!session) return;
        const { data, error } = await supabase
            .from("user_badges")
            .insert({ user_id: session.user.id, badge_id: badgeId })
            .select()
            .single();
        console.log("Award badge result:", badgeId, { data, error });
        if (error) return; // already exists
        const badgeDef = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
        if (badgeDef) {
            const earned: Badge = { ...badgeDef, earned: true, earned_at: new Date().toISOString() };
            setNewBadge(earned);
            setBadges((prev) => prev.map((b) => (b.id === badgeId ? earned : b)));
            setTimeout(() => setNewBadge(null), 4000);
        }
    };
    const checkAndAwardBadges = async () => {
        if (!session) return;
        const userId = session.user.id;
        try {
            const { data: favorites } = await supabase
                .from("favorites")
                .select("track")
                .eq("user_id", userId);
            const favCount = favorites?.length || 0;
            const artistSet = new Set<string>();
            (favorites || []).forEach((row: any) => {
                const track = row.track;
                const artistName =
                    typeof track.artist === "string"
                        ? track.artist
                        : track.artist?.name || "Unknown";
                artistSet.add(artistName);
            });
            const uniqueArtists = artistSet.size;
            const { data: playlists } = await supabase
                .from("playlists")
                .select("tracks")
                .eq("user_id", userId);
            const playlistCount = playlists?.length || 0;
            let totalPlaylistTracks = 0;
            (playlists || []).forEach((p: any) => {
                const tracks = Array.isArray(p.tracks) ? p.tracks : [];
                totalPlaylistTracks += tracks.length;
            });
            const { data: stats } = await supabase
                .from("user_listening_stats")
                .select("click_count, track_id")
                .eq("user_id", userId);
            const totalTracks = stats?.length || 0;
            const totalClicks = (stats || []).reduce(
                (sum: number, s: any) => sum + (s.click_count || 0),
                0
            );
            const { data: friendships } = await supabase
                .from("friendships")
                .select("id")
                .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
                .eq("status", "accepted");
            const friendCount = friendships?.length || 0;
            console.log("🏅 Badge check:", {
                favCount,
                uniqueArtists,
                playlistCount,
                totalPlaylistTracks,
                totalTracks,
                totalClicks,
                friendCount,
            });
            const earned = await fetchEarnedBadges();
            const earnedIds = earned.map((b: any) => b.badge_id);
            const checks: { id: string; condition: boolean }[] = [
                { id: "first_steps", condition: favCount >= 1 },
                { id: "collector", condition: favCount >= 20 },
                { id: "explorer", condition: uniqueArtists >= 10 },
                { id: "playlist_maker", condition: playlistCount >= 1 },
                { id: "dj", condition: totalPlaylistTracks >= 30 },
                { id: "meloman", condition: totalTracks >= 50 },
                { id: "addict", condition: totalClicks >= 200 },
                { id: "social", condition: friendCount >= 1 },
            ];
            for (const check of checks) {
                if (check.condition && !earnedIds.includes(check.id)) {
                    await awardBadge(check.id);
                }
            }
        } catch (err) {
            console.error("Error checking badges:", err);
        }
    };
    return { badges, newBadge, loading, checkAndAwardBadges, loadBadges };
};