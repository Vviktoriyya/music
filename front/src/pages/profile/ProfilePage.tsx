import { useState, useRef, useEffect } from "react";
import Header from "../../components/header/Header.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { useProfile } from "../../hooks/useProfile.ts";
import { useFriends } from "../../hooks/useFriends.ts";
import { useBadges } from "../personalActivity/hooks/useBadges.ts";
import { supabase } from "../../lib/supabaseClient.ts";
import { useNavigate } from "react-router-dom";
import type { Profile } from "../../hooks/useProfile.ts";
const DEFAULT_AVATAR = "/default-artist.png";
export default function ProfilePage() {
    const { session } = useAuth();
    const { profile, loading, updateProfile, uploadAvatar } = useProfile();
    const {
        friends,
        pendingIncoming,
        pendingOutgoing,
        sendFriendRequest,
        acceptFriendRequest,
        removeFriend,
    } = useFriends();
    const { badges } = useBadges();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editing, setEditing] = useState(false);
    const [usernameInput, setUsernameInput] = useState("");
    const [bioInput, setBioInput] = useState("");
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Profile[]>([]);
    const [searching, setSearching] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<{ friendshipId: string; username: string } | null>(null);
    useEffect(() => {
        if (profile) {
            setUsernameInput(profile.username);
            setBioInput(profile.bio || "");
        }
    }, [profile]);
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setMessage("");
        const result = await uploadAvatar(file);
        setMessage(result.success ? "Avatar updated! ✅" : result.error || "Failed");
        setUploading(false);
    };
    const handleSave = async () => {
        setMessage("");
        const result = await updateProfile({ username: usernameInput.trim(), bio: bioInput.trim() });
        if (result.success) { setMessage("Profile saved! ✅"); setEditing(false); }
        else setMessage(result.error || "Failed to save");
    };
    const handleSearch = async () => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const { data, error } = await supabase
                .from("profiles").select("*")
                .ilike("username", `%${searchQuery.trim()}%`)
                .neq("id", session?.user?.id || "").limit(10);
            if (!error && data) setSearchResults(data as Profile[]);
        } catch (err) { console.error("Search error:", err); }
        finally { setSearching(false); }
    };
    const getFriendStatus = (userId: string) => {
        if (friends.some((f) => f.profile.id === userId)) return "friend";
        if (pendingOutgoing.some((f) => f.profile.id === userId)) return "sent";
        if (pendingIncoming.some((f) => f.profile.id === userId)) return "incoming";
        return "none";
    };
    const earnedBadges = badges.filter((b) => b.earned);
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
    return (
        <div className="relative min-h-screen bg-[#0f0f0f] text-white pt-[60px]">
            <Header />
            <div className="px-4 pb-12 pt-24 sm:px-6 lg:px-8 xl:px-16 max-w-5xl mx-auto">
                {/* ПРОФІЛЬ */}
                <div className="backdrop-blur-md bg-[#1f1f1f]/40 border border-white/10 rounded-2xl p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#EE10B0] shadow-lg shadow-[#EE10B0]/50">
                                <img
                                    src={profile?.avatar_url || DEFAULT_AVATAR}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                                />
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 bg-[#EE10B0] hover:bg-[#c80d8f] rounded-full w-10 h-10 flex items-center justify-center text-white transition shadow-lg"
                            >
                                {uploading ? "..." : "📷"}
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            {editing ? (
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="text" value={usernameInput}
                                        onChange={(e) => setUsernameInput(e.target.value)}
                                        placeholder="Username"
                                        className="bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#EE10B0]"
                                    />
                                    <textarea
                                        value={bioInput} onChange={(e) => setBioInput(e.target.value)}
                                        placeholder="Tell something about your music taste..."
                                        rows={2}
                                        className="bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#EE10B0] resize-none"
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={handleSave} className="bg-[#EE10B0] hover:bg-[#c80d8f] px-6 py-2 rounded-lg font-medium transition">Save</button>
                                        <button onClick={() => { setEditing(false); setUsernameInput(profile?.username || ""); setBioInput(profile?.bio || ""); }} className="border border-white/20 hover:bg-white/10 px-6 py-2 rounded-lg font-medium transition">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-black mb-1">{profile?.username}</h1>
                                    <p className="text-gray-400 mb-3">{profile?.bio || "No bio yet"}</p>
                                    {/* Бейджі в рядок */}
                                    {earnedBadges.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {earnedBadges.map((badge) => (
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
                                    <button onClick={() => setEditing(true)} className="border border-[#EE10B0] text-[#EE10B0] hover:bg-[#EE10B0]/20 px-6 py-2 rounded-lg font-medium transition">
                                        Edit Profile
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {message && <p className="mt-4 text-center text-sm text-[#EE10B0]">{message}</p>}
                </div>
                {/* ПОШУК ДРУЗІВ */}
                <div className="backdrop-blur-md bg-[#1f1f1f]/40 border border-white/10 rounded-2xl p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">Find Friends</h2>
                    <div className="flex gap-3 mb-4">
                        <input
                            type="text" value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Search by username..."
                            className="flex-1 bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#EE10B0]"
                        />
                        <button onClick={handleSearch} className="bg-[#EE10B0] hover:bg-[#c80d8f] px-6 py-2 rounded-lg font-medium transition">Search</button>
                    </div>
                    {searching && <p className="text-gray-400">Searching...</p>}
                    {searchResults.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {searchResults.map((user) => {
                                const status = getFriendStatus(user.id);
                                return (
                                    <div key={user.id} className="flex items-center justify-between bg-[#2a2a2a] rounded-lg p-3">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                                            <img src={user.avatar_url || DEFAULT_AVATAR} alt={user.username} className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                            <span className="font-medium">{user.username}</span>
                                        </div>
                                        {status === "friend" && <span className="text-green-400 text-sm">✓ Friend</span>}
                                        {status === "sent" && <span className="text-gray-400 text-sm">Request sent</span>}
                                        {status === "incoming" && <span className="text-blue-400 text-sm">Wants to be friends</span>}
                                        {status === "none" && (
                                            <button onClick={() => sendFriendRequest(user.id)} className="bg-[#EE10B0] hover:bg-[#c80d8f] px-4 py-1.5 rounded-lg text-sm font-medium transition">Add Friend</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {/* ВХІДНІ ЗАПИТИ */}
                {pendingIncoming.length > 0 && (
                    <div className="backdrop-blur-md bg-[#1f1f1f]/40 border border-white/10 rounded-2xl p-6 mb-8">
                        <h2 className="text-2xl font-bold mb-4">Friend Requests ({pendingIncoming.length})</h2>
                        <div className="flex flex-col gap-2">
                            {pendingIncoming.map((req) => (
                                <div key={req.friendshipId} className="flex items-center justify-between bg-[#2a2a2a] rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <img src={req.profile.avatar_url || DEFAULT_AVATAR} alt={req.profile.username} className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                        <span className="font-medium">{req.profile.username}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => acceptFriendRequest(req.friendshipId)} className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg text-sm font-medium transition">Accept</button>
                                        <button onClick={() => removeFriend(req.friendshipId)} className="border border-white/20 hover:bg-white/10 px-4 py-1.5 rounded-lg text-sm font-medium transition">Decline</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* СПИСОК ДРУЗІВ */}
                <div className="backdrop-blur-md bg-[#1f1f1f]/40 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold mb-4">My Friends ({friends.length})</h2>
                    {friends.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No friends yet. Search for users above to add friends!</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {friends.map((friend) => (
                                <div key={friend.friendshipId} className="flex flex-col items-center text-center group">
                                    <div className="relative cursor-pointer" onClick={() => navigate(`/profile/${friend.profile.id}`)}>
                                        <img src={friend.profile.avatar_url || DEFAULT_AVATAR} alt={friend.profile.username} className="w-20 h-20 rounded-full object-cover border-2 border-[#EE10B0] group-hover:scale-105 transition" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                    </div>
                                    <span className="font-medium mt-2 truncate max-w-[100px]">{friend.profile.username}</span>
                                    <button onClick={() => setRemoveTarget({ friendshipId: friend.friendshipId, username: friend.profile.username })} className="text-xs text-gray-500 hover:text-red-400 mt-1 transition">Remove</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* МОДАЛКА ВИДАЛЕННЯ */}
            {removeTarget && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4" onClick={() => setRemoveTarget(null)}>
                    <div className="bg-[#1f1f1f] border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
                        <p className="text-xl font-bold mb-2">Remove Friend?</p>
                        <p className="text-gray-400 mb-6">Are you sure you want to remove <span className="text-white font-medium">{removeTarget.username}</span> from your friends?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={async () => { await removeFriend(removeTarget.friendshipId); setRemoveTarget(null); }} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition">Remove</button>
                            <button onClick={() => setRemoveTarget(null)} className="border border-white/20 hover:bg-white/10 px-6 py-2 rounded-lg font-medium transition">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}