import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext.tsx";
interface TrackInteraction {
    trackId: number;
    artistId?: number;
    genres?: string[];
    action: "click" | "favorite" | "playlist";
}
interface ListeningStatsRecord {
    id: string;
    user_id: string;
    track_id: number;
    artist_id: number | null;
    genres: string[] | null;
    click_count: number;
    favorite_added: boolean;
    playlist_added: boolean;
    last_interaction: string;
}
interface GenreData {
    genre: string;
    score: number;
}
export const useListeningStats = () => {
    const { session } = useAuth();
    const fetchTrackGenres = async (trackId: number): Promise<string[]> => {
        try {
            const trackRes = await fetch(`https://corsproxy.io/?https://api.deezer.com/track/${trackId}`);
            const trackData = await trackRes.json();
            const albumId = trackData?.album?.id;
            if (!albumId) return [];
            const albumRes = await fetch(`https://corsproxy.io/?https://api.deezer.com/album/${albumId}`);
            const albumData = await albumRes.json();
            if (albumData?.genres?.data && Array.isArray(albumData.genres.data)) {
                return albumData.genres.data.map((g: { name: string }) => g.name);
            }
            return [];
        } catch (error) {
            console.error("Error fetching track genres:", error);
            return [];
        }
    };
    const logTrackInteraction = async (interaction: TrackInteraction): Promise<void> => {
        if (!session) return;
        try {
            let genres = interaction.genres || [];
            if (!genres.length) {
                genres = await fetchTrackGenres(interaction.trackId);
            }
            console.log(`Logging ${interaction.action} for track ${interaction.trackId}, genres:`, genres);
            const { data: existing, error: fetchError } = await supabase
                .from("user_listening_stats")
                .select("*")
                .eq("user_id", session.user.id)
                .eq("track_id", interaction.trackId)
                .single();
            if (fetchError && fetchError.code !== "PGRST116") {
                console.error("Error fetching existing record:", fetchError);
                return;
            }
            if (existing) {
                const updates: Partial<ListeningStatsRecord> = {
                    last_interaction: new Date().toISOString(),
                    genres: genres.length > 0 ? genres : existing.genres,
                };
                if (interaction.action === "click") {
                    updates.click_count = (existing.click_count || 0) + 1;
                } else if (interaction.action === "favorite") {
                    updates.favorite_added = true;
                } else if (interaction.action === "playlist") {
                    updates.playlist_added = true;
                }
                const { error: updateError } = await supabase
                    .from("user_listening_stats")
                    .update(updates)
                    .eq("user_id", session.user.id)
                    .eq("track_id", interaction.trackId);
                if (updateError) {
                    console.error("Error updating record:", updateError);
                }
            } else {
                const newRecord: Partial<ListeningStatsRecord> = {
                    user_id: session.user.id,
                    track_id: interaction.trackId,
                    artist_id: interaction.artistId || null,
                    genres: genres.length > 0 ? genres : null,
                    click_count: interaction.action === "click" ? 1 : 0,
                    favorite_added: interaction.action === "favorite",
                    playlist_added: interaction.action === "playlist",
                };
                const { error: insertError } = await supabase
                    .from("user_listening_stats")
                    .insert([newRecord]);
                if (insertError) {
                    console.error("Error inserting record:", insertError);
                }
            }
            await updateDailyStats();
        } catch (error) {
            console.error("Error logging interaction:", error);
        }
    };
    const updateDailyStats = async (): Promise<void> => {
        if (!session) return;
        try {
            const today = new Date().toISOString().split("T")[0];
            const { data: stats, error: fetchError } = await supabase
                .from("user_listening_stats")
                .select("*")
                .eq("user_id", session.user.id)
                .gte("last_interaction", `${today}T00:00:00`)
                .lte("last_interaction", `${today}T23:59:59`);
            if (fetchError) {
                console.error("Error fetching stats:", fetchError);
                return;
            }
            if (!stats || stats.length === 0) return;
            const uniqueTracks = new Set(stats.map((s: any) => s.track_id)).size;
            const totalClicks = stats.reduce((sum: number, s: any) => sum + (s.click_count || 0), 0);
            const allGenres = stats.flatMap((s: any) => s.genres || []);
            const genres = Array.from(new Set(allGenres));
            console.log(`Daily stats for ${today}: ${uniqueTracks} tracks, ${totalClicks} clicks, genres:`, genres);
            const { data: existing, error: dailyFetchError } = await supabase
                .from("daily_listening_stats")
                .select("*")
                .eq("user_id", session.user.id)
                .eq("date", today)
                .single();
            if (dailyFetchError && dailyFetchError.code !== "PGRST116") {
                console.error("Error fetching daily stats:", dailyFetchError);
                return;
            }
            if (existing) {
                const { error: updateError } = await supabase
                    .from("daily_listening_stats")
                    .update({
                        tracks_count: uniqueTracks,
                        clicks_count: totalClicks,
                        genres,
                    })
                    .eq("user_id", session.user.id)
                    .eq("date", today);
                if (updateError) {
                    console.error("Error updating daily stats:", updateError);
                }
            } else {
                const { error: insertError } = await supabase
                    .from("daily_listening_stats")
                    .insert({
                        user_id: session.user.id,
                        date: today,
                        tracks_count: uniqueTracks,
                        clicks_count: totalClicks,
                        genres,
                    });
                if (insertError) {
                    console.error("Error inserting daily stats:", insertError);
                }
            }
        } catch (error) {
            console.error("Error updating daily stats:", error);
        }
    };
    const getTopGenres = async (): Promise<GenreData[]> => {
        if (!session) return [];
        try {
            const { data, error } = await supabase
                .from("user_listening_stats")
                .select("genres, click_count, favorite_added")
                .eq("user_id", session.user.id);
            if (error) {
                console.error("Error getting genres:", error);
                return [];
            }
            if (!data) return [];
            const genreScores: Record<string, number> = {};
            data.forEach((item: any) => {
                if (item && typeof item === 'object') {
                    const weight = (item.click_count || 0) + (item.favorite_added ? 5 : 0);
                    const genres = Array.isArray(item.genres) ? item.genres : [];
                    genres.forEach((genre: string) => {
                        genreScores[genre] = (genreScores[genre] || 0) + weight;
                    });
                }
            });
            const result = Object.entries(genreScores)
                .map(([genre, score]) => ({ genre, score }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
            console.log("Top genres:", result);
            return result;
        } catch (error) {
            console.error("Error getting top genres:", error);
            return [];
        }
    };
    const getUserStats = async () => {
        if (!session) return null;
        try {
            const { data: stats, error } = await supabase
                .from("user_listening_stats")
                .select("*")
                .eq("user_id", session.user.id);
            if (error) {
                console.error("Error getting stats:", error);
                return null;
            }
            if (!stats || stats.length === 0) return null;
            const totalTracks = stats.length;
            const totalClicks = stats.reduce((sum: number, s: any) => sum + (s.click_count || 0), 0);
            const favoriteTracks = stats.filter((s: any) => s.favorite_added).length;
            const playlistTracks = stats.filter((s: any) => s.playlist_added).length;
            const avgClicksPerTrack = (totalClicks / totalTracks).toFixed(1);
            const artistCounts: Record<number, number> = {};
            stats.forEach((stat: any) => {
                if (stat.artist_id) {
                    artistCounts[stat.artist_id] = (artistCounts[stat.artist_id] || 0) + (stat.click_count || 0);
                }
            });
            const topArtists = Object.entries(artistCounts)
                .map(([id, count]) => ({ id: Number(id), count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            return {
                totalTracks,
                totalClicks,
                favoriteTracks,
                playlistTracks,
                avgClicksPerTrack,
                topArtists,
            };
        } catch (error) {
            console.error("Error getting user stats:", error);
            return null;
        }
    };
    const getDailyStats = async (days: number = 30) => {
        if (!session) return [];
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startDateStr = startDate.toISOString().split("T")[0];
            const { data, error } = await supabase
                .from("daily_listening_stats")
                .select("*")
                .eq("user_id", session.user.id)
                .gte("date", startDateStr)
                .order("date", { ascending: true });
            if (error) {
                console.error("Error getting daily stats:", error);
                return [];
            }
            console.log("Daily stats data:", data);
            return data || [];
        } catch (error) {
            console.error("Error getting daily stats:", error);
            return [];
        }
    };
    return {
        logTrackInteraction,
        getTopGenres,
        getUserStats,
        getDailyStats,
    };
};