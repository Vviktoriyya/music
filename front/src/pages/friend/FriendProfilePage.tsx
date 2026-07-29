import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/header/Header.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { useFriendMusic } from "../../hooks/useFriendMusic.ts";
import { useFriends } from "../../hooks/useFriends.ts";
import { supabase } from "../../lib/supabaseClient.ts";
import { BADGE_DEFINITIONS } from "../personalActivity/hooks/useBadges.ts";
import axios from "axios";
import { useEffect, useState } from "react";
const DEFAULT_AVATAR = "/default-artist.png";
interface ArtistDisplay {
    name: string;
    count: number;
    picture: string;
}
interface EarnedBadge {
    id: string;
    label: string;
    icon: string;
    color: string;
    description: string;
}
export default function FriendProfilePage() {
    const { id } = useParams<{ id: string }>();
    const { session } = useAuth();
    const navigate = useNavigate();
    const { data, loading } = useFriendMusic(id);
    const { friends } = useFriends();
    const [artistsWithPics, setArtistsWithPics] = useState<ArtistDisplay[]>([]);
    const [friendBadges, setFriendBadges] = useState<EarnedBadge[]>([]);
    const isFriend = friends.some((f) => f.profile.id === id);
    useEffect(() => {
        const loadBadges = async () => {
            if (!id) return;
            const { data: earned } = await supabase
                .from("user_badges")
                .select("badge_id")
                .eq("user_id", id);
            if (!earned) return;
            const earnedIds = earned.map((b: any) => b.badge_id);
            const badges = BADGE_DEFINITIONS.filter((b) => earnedIds.includes(b.id));
            setFriendBadges(badges);
        };
        loadBadges();
    }, [id]);
    useEffect(() => {
        const loadPics = async () => {
            if (!data?.topArtists.length) { setArtistsWithPics([]); return; }
            const result = await Promise.all(
                data.topArtists.slice(0, 6).map(async (artist) => {
                    try {
                        const res = await axios.get(`https://corsproxy.io/?https://api.deezer.com/search/artist?q=${encodeURIComponent(artist.name)}&limit=1`);
                        const found = res.data.data?.[0];
                        return { name: artist.name, count: artist.count, picture: found?.picture_big || found?.picture_medium || DEFAULT_AVATAR };
                    } catch {
                        return { name: artist.name, count: artist.count, picture: DEFAULT_AVATAR };
                    }
                })
            );
            setArtistsWithPics(result);
        };
        loadPics();
    }, [data?.topArtists]);
    if (!session) {
        return (
            <div className="relative h-full w-full pt-[60px] bg-[#0f0f0f]">
                <Header />
                <div className="px-4 pb-12 pt-24 text-white sm:px-6 lg:px-8 xl:px-16">
                    <p className="text-center text-gray-400 text-[20px]">Please register or log in first :)</p>
                </div>
            </div>
        );
    }
    if (loading) {
        return (
            <div className="relative min-h-screen bg-[#0f0f0f] pt-[60px]">
                <Header />
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin w-8 h-8 border-2 border-[#EE10B0] border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }
    if (!data?.profile) {
        return (
            <div className="relative min-h-screen bg-[#0f0f0f] pt-[60px] text-white">
                <Header />
                <div className="px-4 pb-12 pt-24 sm:px-6 lg:px-8 xl:px-16 text-center">
                    <p className="text-gray-400 text-[20px]">User not found</p>
                </div>
            </div>
        );
    }
    const compatColor = data.compatibility >= 50 ? "text-green-400" : data.compatibility >= 25 ? "text-yellow-400" : "text-gray-400";
    return (
        <div className="relative min-h-screen bg-[#0f0f0f] text-white pt-[60px]">
            <Header />
            <div className="px-4 pb-12 pt-24 sm:px-6 lg:px-8 xl:px-16 max-w-5xl mx-auto">
                <button onClick={() => navigate("/profile")} className="text-gray-400 hover:text-white mb-6 transition">
                    ← Back to my profile
                </button>
                {/* ПРОФІЛЬ ДРУГА */}
                <div className="backdrop-blur-md bg-[#1f1f1f]/40 border border-white/10 rounded-2xl p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#EE10B0] shadow-lg shadow-[#EE10B0]/50">
                            <img
                                src={data.profile.avatar_url || DEFAULT_AVATAR}
                                alt={data.profile.username}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                            />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-3xl font-black mb-1">{data.profile.username}</h1>
                            <p className="text-gray-400 mb-3">{data.profile.bio || "No bio yet"}</p>
                            {/* Бейджі друга в рядок */}
                            {friendBadges.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {friendBadges.map((badge) => (
                                        <div
                                            key={badge.id}
                                            title={`${badge.label} — ${badge.description}`}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center text-lg bg-gradient-to-br ${badge.color} shadow-md cursor-default`}
                                        >
                                            {badge.icon}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isFriend && <span className="inline-block text-green-400 text-sm">✓ Friend</span>}
                        </div>
                    </div>
                </div>
                {/* СУМІСНІСТЬ */}
                <div className="backdrop-blur-md bg-[#1f1f1f]/40 border border-white/10 rounded-2xl p-8 mb-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Music Taste Compatibility</h2>
                    <div className={`text-6xl font-black mb-2 ${compatColor}`}>{data.compatibility}%</div>
                    <div className="w-full max-w-md mx-auto bg-[#333] rounded-full h-3 mt-4 mb-4">
                        <div className="bg-gradient-to-r from-[#EE10B0] to-purple-600 h-3 rounded-full transition-all" style={{ width: `${data.compatibility}%` }} />
                    </div>
                    {data.commonArtists.length > 0 ? (
                        <p className="text-gray-400">You both like: <span className="text-white font-medium">{data.commonArtists.slice(0, 5).join(", ")}</span>{data.commonArtists.length > 5 && ` and ${data.commonArtists.length - 5} more`}</p>
                    ) : (
                        <p className="text-gray-400">No common artists yet — explore each other's taste!</p>
                    )}
                </div>
                {/* СТАТИСТИКА */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="backdrop-blur-md bg-[#1f1f1f]/40 border border-white/10 rounded-2xl p-6 text-center">
                        <p className="text-4xl font-bold text-purple-500">{data.favoriteCount}</p>
                        <p className="text-gray-400 text-sm mt-2">favorite tracks</p>
                    </div>
                    <div className="backdrop-blur-md bg-[#1f1f1f]/40 border border-white/10 rounded-2xl p-6 text-center">
                        <p className="text-4xl font-bold text-green-500">{data.playlistCount}</p>
                        <p className="text-gray-400 text-sm mt-2">playlists</p>
                    </div>
                </div>
                {/* ТОП АРТИСТИ */}
                <div className="backdrop-blur-md bg-[#1f1f1f]/40 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold mb-6">{data.profile.username}'s Top Artists</h2>
                    {artistsWithPics.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No favorite artists yet</p>
                    ) : (
                        <div className="flex flex-wrap gap-6 justify-center">
                            {artistsWithPics.map((artist) => (
                                <div key={artist.name} className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#EE10B0] shadow-lg shadow-[#EE10B0]/50">
                                        <img src={artist.picture} alt={artist.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                    </div>
                                    <span className="font-medium mt-2 max-w-[100px] truncate">{artist.name}</span>
                                    <span className="text-xs text-gray-500">{artist.count} {artist.count === 1 ? "track" : "tracks"}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}