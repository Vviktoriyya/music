import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.tsx";
import Header from "../../components/header/Header.tsx";
import axios from "axios";
import { useFavorites } from "../favorites/hooks/useFavorites.ts";
import { useListeningStats } from "./hooks/useListeningStats.ts";
import { useBadges } from "./hooks/useBadges.ts";
import type { Badge } from "./hooks/useBadges.ts";
interface UserStats {
    totalTracks: number;
    totalClicks: number;
    favoriteTracks: number;
    playlistTracks: number;
    avgClicksPerTrack: string;
    topArtists: Array<{ id: number; count: number }>;
}
interface DailyStat {
    date: string;
    tracks_count: number;
    clicks_count: number;
    genres: string[];
}
interface ArtistWithCount {
    id: number;
    name: string;
    picture: string;
    count: number;
}
export default function InsightsAndRecommendations() {
    const { session } = useAuth();
    const { getUserStats, getDailyStats } = useListeningStats();
    const { favorites } = useFavorites();
    const { badges, newBadge, loading: badgesLoading, checkAndAwardBadges } = useBadges();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [topArtists, setTopArtists] = useState<ArtistWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadData = async (): Promise<void> => {
            if (!session) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [userStats, daily] = await Promise.all([
                    getUserStats(),
                    getDailyStats(30),
                ]);
                setStats(userStats);
                setDailyStats(daily);
                if (favorites && favorites.length > 0) {
                    await loadArtistsFromFavorites();
                }
                await checkAndAwardBadges();
            } catch (error) {
                console.error("Error loading insights:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [session, favorites]);
    const loadArtistsFromFavorites = async (): Promise<void> => {
        try {
            const artistCounts: Record<string, { count: number; name: string; id?: number }> = {};
            favorites.forEach((track: any) => {
                const artistName =
                    typeof track.artist === "string"
                        ? track.artist
                        : track.artist?.name || "Unknown";
                const artistId =
                    typeof track.artist === "string"
                        ? 0
                        : track.artist?.id || 0;
                if (!artistCounts[artistName]) {
                    artistCounts[artistName] = { count: 0, name: artistName, id: artistId };
                }
                artistCounts[artistName].count++;
            });
            const topArtistsArray = Object.values(artistCounts)
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            const artistsWithPictures: ArtistWithCount[] = await Promise.all(
                topArtistsArray.map(async (artist) => {
                    try {
                        const searchResponse = await axios.get(
                            `https://corsproxy.io/?https://api.deezer.com/search/artist?q=${encodeURIComponent(artist.name)}&limit=1`
                        );
                        if (searchResponse.data.data?.length > 0) {
                            const found = searchResponse.data.data[0];
                            const pic =
                                found.picture_xl ||
                                found.picture_big ||
                                found.picture_medium ||
                                found.picture ||
                                "/default-artist.png";
                            return { id: found.id, name: found.name, picture: pic, count: artist.count };
                        }
                    } catch (err) {
                        console.error(`Search error for ${artist.name}:`, err);
                    }
                    if (artist.id && artist.id !== 0) {
                        try {
                            const response = await axios.get(
                                `https://corsproxy.io/?https://api.deezer.com/artist/${artist.id}`
                            );
                            const pic =
                                response.data.picture_xl ||
                                response.data.picture_big ||
                                response.data.picture_medium ||
                                response.data.picture ||
                                "/default-artist.png";
                            return { id: response.data.id, name: response.data.name, picture: pic, count: artist.count };
                        } catch (err) {
                            console.error(`Artist fetch error for ${artist.id}:`, err);
                        }
                    }
                    return { id: 0, name: artist.name, picture: "/default-artist.png", count: artist.count };
                })
            );
            setTopArtists(artistsWithPictures);
        } catch (error) {
            console.error("Error loading artists from favorites:", error);
        }
    };
    if (!session) {
        return (
            <div className="relative h-full w-full pt-[60px] bg-[#0a0a0a]">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-60px)]">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🎵</div>
                        <p className="text-gray-400 text-lg">Please sign in to view your music insights</p>
                    </div>
                </div>
            </div>
        );
    }
    const earnedBadges = badges.filter((b) => b.earned);
    const unearnedBadges = badges.filter((b) => !b.earned);
    const progressPercent = badges.length > 0 ? Math.round((earnedBadges.length / badges.length) * 100) : 0;
    return (
        <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden pt-[160px]">
            <Header />
            {/* New badge toast */}
            {newBadge && (
                <div className="fixed top-20 right-4 z-[99999] animate-[slideIn_0.4s_ease-out]">
                    <div
                        className="bg-[#141414] border border-[#EE10B0]/50 rounded-2xl px-5 py-4 shadow-2xl shadow-[#EE10B0]/20 flex items-center gap-4 max-w-xs"
                        style={{ backdropFilter: "blur(20px)" }}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br ${newBadge.color}`}>
                            {newBadge.icon}
                        </div>
                        <div>
                            <p className="text-[10px] text-[#EE10B0] font-bold uppercase tracking-widest mb-0.5">New Badge Unlocked!</p>
                            <p className="font-bold text-white text-sm">{newBadge.label}</p>
                            <p className="text-xs text-gray-400 leading-tight">{newBadge.description}</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Ambient background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-8"
                    style={{ background: "radial-gradient(circle, #EE10B0 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-6"
                    style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
                />
            </div>
            <div className="relative z-10 px-4 pb-20 pt-12 sm:px-6 lg:px-10 xl:px-16 max-w-7xl mx-auto">
                {/* ── Page header ── */}
                <div className="mb-14">
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#EE10B0] mb-3">Your Dashboard</p>
                    <h1 className="text-5xl sm:text-6xl font-black leading-none mb-3 tracking-tight">
                        Music{" "}
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: "linear-gradient(90deg, #3b82f6, #EE10B0)" }}
                        >
                            Insights
                        </span>
                    </h1>
                    <p className="text-gray-500 text-base max-w-xl">
                        Personalized statistics and achievements based on your listening activity.
                    </p>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-80 gap-4">
                        <div className="w-10 h-10 border-2 border-[#EE10B0] border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-600 text-sm">Loading your data…</p>
                    </div>
                ) : (
                    <>
                        {/* ── Stats grid ── */}
                        {stats && (
                            <section className="mb-12">
                                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-600 mb-5">Overview</h2>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard
                                        label="Tracks Explored"
                                        value={stats.totalTracks}
                                        sub="unique tracks"
                                        accent="#3b82f6"
                                    />
                                    <StatCard
                                        label="Total Interactions"
                                        value={stats.totalClicks}
                                        sub="clicks & actions"
                                        accent="#EE10B0"
                                    />
                                    <StatCard
                                        label="Favorite Tracks"
                                        value={stats.favoriteTracks}
                                        sub="saved tracks"
                                        accent="#a855f7"
                                    />
                                    <StatCard
                                        label="Playlist Tracks"
                                        value={stats.playlistTracks}
                                        sub="in playlists"
                                        accent="#22c55e"
                                    />
                                </div>
                            </section>
                        )}
                        {/* ── Badges section ── */}
                        <section className="mb-12">
                            <div
                                className="rounded-2xl p-6 sm:p-8 border border-white/[0.06]"
                                style={{ background: "rgba(20,20,20,0.7)", backdropFilter: "blur(16px)" }}
                            >
                                {/* Header row */}
                                <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                                            🏅 <span>Achievements</span>
                                        </h2>
                                        <p className="text-gray-500 text-sm">
                                            {earnedBadges.length} of {badges.length} badges earned
                                        </p>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="sm:w-48">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                                            <span>Progress</span>
                                            <span className="text-[#EE10B0] font-semibold">{progressPercent}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${progressPercent}%`,
                                                    background: "linear-gradient(90deg, #3b82f6, #EE10B0)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Earned */}
                                {earnedBadges.length > 0 && (
                                    <div className="mb-8">
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">
                                            Earned
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                            {earnedBadges.map((badge) => (
                                                <BadgeCard key={badge.id} badge={badge} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Locked */}
                                {unearnedBadges.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">
                                            Locked
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                            {unearnedBadges.map((badge) => (
                                                <BadgeCard key={badge.id} badge={badge} locked />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {badges.length === 0 && !badgesLoading && (
                                    <p className="text-gray-600 text-center py-10">
                                        Start listening to unlock achievements!
                                    </p>
                                )}
                            </div>
                        </section>
                        {/* ── Activity chart ── */}
                        <section className="mb-12">
                            <div
                                className="rounded-2xl p-6 sm:p-8 border border-white/[0.06]"
                                style={{ background: "rgba(20,20,20,0.7)", backdropFilter: "blur(16px)" }}
                            >
                                <h2 className="text-2xl font-bold mb-1">📈 Activity</h2>
                                <p className="text-gray-500 text-sm mb-8">Last 30 days</p>
                                {dailyStats.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                        <span className="text-4xl">🎧</span>
                                        <p className="text-gray-500">No activity yet. Start exploring music!</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Y-axis label */}
                                        <p className="text-[10px] text-gray-700 uppercase tracking-widest mb-3">Interactions</p>
                                        <div className="flex items-end gap-[3px] h-40">
                                            {dailyStats.slice(-30).map((stat, idx) => {
                                                const maxClicks = Math.max(...dailyStats.map((s) => s.clicks_count || 0), 1);
                                                const heightPct = (stat.clicks_count / maxClicks) * 100;
                                                const isToday = idx === dailyStats.slice(-30).length - 1;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="relative flex-1 group cursor-pointer rounded-t-sm transition-all duration-200 hover:opacity-100 opacity-80"
                                                        style={{
                                                            height: `${Math.max(heightPct, 4)}%`,
                                                            minWidth: "6px",
                                                            background: isToday
                                                                ? "linear-gradient(to top, #EE10B0, #f472b6)"
                                                                : "linear-gradient(to top, #3b82f6, #8b5cf6)",
                                                        }}
                                                        title={`${stat.date}: ${stat.clicks_count} interactions`}
                                                    >
                                                        {/* Tooltip */}
                                                        {stat.clicks_count > 0 && (
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-[#1f1f1f] border border-white/10 rounded-lg px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                                <p className="text-white font-semibold">{stat.clicks_count}</p>
                                                                <p className="text-gray-500">{stat.date}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-700 mt-2">
                                            <span>30 days ago</span>
                                            <span>Today</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                        {/* ── Top Artists ── */}
                        <section>
                            <div
                                className="rounded-2xl p-6 sm:p-8 border border-white/[0.06]"
                                style={{ background: "rgba(20,20,20,0.7)", backdropFilter: "blur(16px)" }}
                            >
                                <h2 className="text-2xl font-bold mb-1">⭐ Top Artists</h2>
                                <p className="text-gray-500 text-sm mb-8">Based on your favorite tracks</p>
                                {topArtists.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                        <span className="text-4xl">🎤</span>
                                        <p className="text-gray-500">Add favorite tracks to discover your top artists.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                                        {topArtists.map((artist, index) => (
                                            <div
                                                key={`${artist.id}-${artist.name}`}
                                                className="group flex flex-col items-center text-center cursor-pointer"
                                            >
                                                <div className="relative mb-3">
                                                    {/* Rank badge */}
                                                    {index < 3 && (
                                                        <div
                                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 border border-[#0a0a0a]"
                                                            style={{
                                                                background: index === 0 ? "#f59e0b" : index === 1 ? "#94a3b8" : "#b45309",
                                                                color: "#0a0a0a",
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </div>
                                                    )}
                                                    <div
                                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-110"
                                                        style={{
                                                            boxShadow: "0 0 0 2px rgba(238,16,176,0.4)",
                                                        }}
                                                    >
                                                        <img
                                                            src={artist.picture}
                                                            alt={artist.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.src = "/default-artist.png"; }}
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs font-semibold text-white group-hover:text-[#EE10B0] transition-colors duration-200 max-w-[90px] truncate leading-tight">
                                                    {artist.name}
                                                </p>
                                                <p className="text-[10px] text-gray-600 mt-0.5">
                                                    {artist.count} {artist.count === 1 ? "track" : "tracks"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
function StatCard({
                      label,
                      value,
                      sub,
                      accent,
                  }: {
    label: string;
    value: number;
    sub: string;
    accent: string;
}) {
    return (
        <div
            className="rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-3"
            style={{ background: "rgba(20,20,20,0.7)", backdropFilter: "blur(16px)" }}
        >
            <div
                className="w-2 h-2 rounded-full"
                style={{ background: accent }}
            />
            <div>
                <p className="text-gray-500 text-xs mb-1 leading-tight">{label}</p>
                <p className="text-3xl sm:text-4xl font-black tracking-tighter" style={{ color: accent }}>
                    {value.toLocaleString()}
                </p>
                <p className="text-gray-700 text-[10px] mt-1 uppercase tracking-widest">{sub}</p>
            </div>
        </div>
    );
}
function BadgeCard({ badge, locked }: { badge: Badge; locked?: boolean }) {
    return (
        <div
            className={`
                relative flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200
                ${locked
                ? "bg-white/[0.02] border-white/[0.04] opacity-35 grayscale"
                : "bg-white/[0.04] border-white/[0.08] hover:border-[#EE10B0]/30 hover:bg-white/[0.07] hover:-translate-y-0.5"
            }
            `}
        >
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-2 ${
                    locked ? "bg-white/5" : `bg-gradient-to-br ${badge.color}`
                }`}
            >
                {badge.icon}
            </div>
            <p className="text-[11px] font-bold text-white leading-tight mb-0.5">{badge.label}</p>
            <p className="text-[9px] text-gray-600 leading-tight">{badge.description}</p>
            {badge.earned_at && !locked && (
                <p className="text-[9px] text-[#EE10B0] mt-1.5 font-medium">
                    {new Date(badge.earned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
            )}
        </div>
    );
}