import { useState } from "react";
import { usePlaylist } from "./hooks/usePlaylist.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { useSearch } from "../../hooks/useSearch.ts";
import { useFriends } from "../../hooks/useFriends.ts";
import Header from "../../components/header/Header.tsx";
import TrackModal from "../../components/TrackModal.tsx";
import type { Track } from "../../types/track.ts";
import type { Recording } from "../../types/search.ts";
import DeleteConfirmModal from "./deleteModal/DeleteConfirmModal.tsx";
import { useListeningStats } from "../personalActivity/hooks/useListeningStats.ts";
const DEFAULT_AVATAR = "/default-artist.png";
interface Toast {
    id: number;
    message: string;
    type: "success" | "error";
}
export default function Playlist() {
    const { session } = useAuth();
    const {
        playlists,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        addMemberToPlaylist,
        removeMemberFromPlaylist,
        leavePlaylist,
        loading,
    } = usePlaylist();
    const { logTrackInteraction } = useListeningStats();
    const { friends } = useFriends();
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [newIsShared, setNewIsShared] = useState(false);
    const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [filter, setFilter] = useState<"all" | "solo" | "shared">("all");
    const [toasts, setToasts] = useState<Toast[]>([]);
    const { data, isLoading } = useSearch(search);
    const showToast = (message: string, type: "success" | "error" = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    };
    const handleCreate = async () => {
        if (!newPlaylistName.trim()) return;
        await createPlaylist(newPlaylistName.trim(), newIsShared);
        setNewPlaylistName("");
        setNewIsShared(false);
    };
    const handleDeletePlaylist = async () => {
        if (!deleteConfirm) return;
        await deletePlaylist(deleteConfirm.id);
        if (activePlaylistId === deleteConfirm.id) setActivePlaylistId(null);
        setDeleteConfirm(null);
    };
    const mapRecordingToTrack = (recording: Recording): Track => ({
        id: recording.id,
        name: recording.title,
        title: recording.title,
        artist: { id: "0", name: recording.artist ?? "Unknown" },
        link: recording.link ?? "",
        duration: recording.duration ?? 0,
        rank: recording.rank ?? 0,
        cover: recording.cover ?? undefined,
        album: { id: 0, title: recording.title, link: "", cover: recording.cover ?? "", release_date: undefined },
        preview: recording.preview ?? null,
        full: recording.full ?? null,
        release_date: recording.releaseDate ?? undefined,
    });
    const handleAddTrackToPlaylist = async (playlistId: string, track: Track) => {
        await addTrackToPlaylist(playlistId, track);
        await logTrackInteraction({
            trackId: Number(track.id),
            artistId: typeof track.artist === "string" ? undefined : track.artist?.id ? Number(track.artist.id) : undefined,
            action: "playlist",
        });
        setSearch("");
    };
    const handleAddMember = async (playlistId: string, userId: string, username: string) => {
        const result = await addMemberToPlaylist(playlistId, userId);
        if (result.success) showToast(`✅ ${username} added to playlist!`);
        else showToast(`❌ ${result.error || "Failed to add member"}`, "error");
    };
    const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
    const isOwnerOfActive = activePlaylist?.owner_id === session?.user?.id;
    const filteredPlaylists = playlists.filter((p) => {
        if (filter === "solo") return !p.is_shared;
        if (filter === "shared") return p.is_shared;
        return true;
    });
    const availableFriends = activePlaylist
        ? friends.filter((f) => !activePlaylist.members.some((m) => m.user_id === f.profile.id))
        : [];
    if (!session) {
        return (
            <div className="relative h-full w-full pt-[60px] bg-[#0a0a0a]">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-60px)]">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🎵</div>
                        <p className="text-gray-500 text-lg">Please sign in to manage playlists</p>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden pt-[60px]">
            <Header />
            {/* Ambient background */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
                     style={{ background: "radial-gradient(circle, #EE10B0, transparent 70%)" }} />
                <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
                     style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }} />
            </div>
            {/* Toasts */}
            <div className="fixed top-20 right-4 z-[99999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id}
                         className={`px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border pointer-events-auto ${
                             toast.type === "success"
                                 ? "bg-[#141414] border-[#EE10B0]/40 text-white"
                                 : "bg-[#141414] border-red-500/40 text-red-400"
                         }`}
                         style={{ backdropFilter: "blur(20px)" }}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
            <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 xl:pt-14">
                {/* ── Page header ── */}
                <div className="mb-10">
                    <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#EE10B0] mb-2">Your Library</p>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
                        My{" "}
                        <span className="bg-clip-text text-transparent"
                              style={{ backgroundImage: "linear-gradient(90deg, #EE10B0, #a855f7)" }}>
                            Playlists
                        </span>
                    </h1>
                </div>
                {/* ── Create playlist ── */}
                <div className="mb-8 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-600 mb-4">New Playlist</p>
                    <div className="flex gap-3 flex-col sm:flex-row">
                        <input
                            type="text"
                            placeholder="Playlist name..."
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] text-white text-sm outline-none border border-white/[0.08] focus:border-[#EE10B0]/60 transition placeholder-gray-600"
                        />
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] cursor-pointer hover:border-[#EE10B0]/40 transition select-none text-sm text-gray-400 hover:text-white">
                            <input
                                type="checkbox"
                                checked={newIsShared}
                                onChange={(e) => setNewIsShared(e.target.checked)}
                                className="w-4 h-4 accent-[#EE10B0]"
                            />
                            <span>🤝 Shared</span>
                        </label>
                        <button
                            onClick={handleCreate}
                            disabled={!newPlaylistName.trim()}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#EE10B0]/20"
                            style={{ background: "linear-gradient(135deg, #EE10B0, #a855f7)" }}
                        >
                            + Create
                        </button>
                    </div>
                </div>
                {/* ── Filter tabs ── */}
                <div className="flex gap-2 mb-8">
                    {(["all", "solo", "shared"] as const).map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    filter === f
                                        ? "text-white"
                                        : "bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-gray-300"
                                }`}
                                style={filter === f ? { background: "linear-gradient(135deg, #EE10B0, #a855f7)" } : {}}
                        >
                            {f === "all" ? "All" : f === "solo" ? "Solo" : "Shared 🤝"}
                        </button>
                    ))}
                </div>
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-[#EE10B0] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <div className="flex gap-6 flex-col xl:flex-row">
                    {/* ── Left: playlist list ── */}
                    <div className="xl:w-[280px] shrink-0">
                        <div className="sticky top-[100px]">
                            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-600 mb-3">
                                {filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? "s" : ""}
                            </p>
                            {filteredPlaylists.length === 0 ? (
                                <div className="rounded-xl border border-white/[0.06] p-8 text-center text-gray-600">
                                    <p className="text-2xl mb-2">📭</p>
                                    <p className="text-sm">No playlists yet</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    {filteredPlaylists.map((p) => {
                                        const isOwner = p.owner_id === session.user.id;
                                        const isActive = activePlaylistId === p.id;
                                        return (
                                            <div key={p.id} onClick={() => setActivePlaylistId(p.id)}
                                                 className="group relative px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
                                                 style={{
                                                     background: isActive
                                                         ? "linear-gradient(135deg, rgba(238,16,176,0.15), rgba(168,85,247,0.1))"
                                                         : "rgba(255,255,255,0.02)",
                                                     border: isActive
                                                         ? "1px solid rgba(238,16,176,0.4)"
                                                         : "1px solid rgba(255,255,255,0.05)",
                                                 }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className={`font-semibold text-sm truncate ${isActive ? "text-[#EE10B0]" : "text-white"}`}>
                                                                {p.name}
                                                            </p>
                                                            {p.is_shared && <span className="text-xs">🤝</span>}
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-0.5">
                                                            {p.tracks.length} track{p.tracks.length !== 1 ? "s" : ""}
                                                            {p.is_shared && ` · ${p.members.length} members`}
                                                            {!isOwner && " · joined"}
                                                        </p>
                                                    </div>
                                                    {isOwner && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: p.id, name: p.name }); }}
                                                            className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all ml-1"
                                                        >
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* ── Right: playlist detail ── */}
                    {activePlaylist ? (
                        <div className="flex-1 min-w-0">
                            {/* Detail header */}
                            <div className="mb-8 pb-6 border-b border-white/[0.06]">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                            <h2 className="text-3xl font-black tracking-tight">{activePlaylist.name}</h2>
                                            {activePlaylist.is_shared && (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                                                      style={{ background: "rgba(238,16,176,0.1)", border: "1px solid rgba(238,16,176,0.3)", color: "#EE10B0" }}>
                                                    🤝 Shared
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {activePlaylist.tracks.length} tracks
                                            {activePlaylist.is_shared && ` · ${activePlaylist.members.length} members`}
                                        </p>
                                    </div>
                                    {activePlaylist.is_shared && (
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowMembersModal(true)}
                                                    className="px-4 py-2 rounded-xl text-sm font-medium border border-white/[0.08] bg-white/[0.03] hover:border-[#EE10B0]/40 hover:text-white text-gray-400 transition">
                                                👥 Members
                                            </button>
                                            {!isOwnerOfActive && (
                                                <button
                                                    onClick={() => { if (confirm("Leave this playlist?")) { leavePlaylist(activePlaylist.id); setActivePlaylistId(null); } }}
                                                    className="px-4 py-2 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition">
                                                    Leave
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Member avatars */}
                                {activePlaylist.is_shared && activePlaylist.members.length > 0 && (
                                    <div className="flex items-center gap-2 mt-4">
                                        <div className="flex -space-x-2">
                                            {activePlaylist.members.slice(0, 6).map((m) => (
                                                <img key={m.user_id} src={m.avatar_url || DEFAULT_AVATAR} alt={m.username} title={m.username}
                                                     className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] object-cover"
                                                     onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                            ))}
                                        </div>
                                        {activePlaylist.members.length > 6 && (
                                            <span className="text-xs text-gray-600">+{activePlaylist.members.length - 6} more</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Search to add tracks */}
                            <div className="mb-8 relative">
                                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-600 mb-3">Add Tracks</p>
                                <div className="relative">
                                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                                    </svg>
                                    <input type="text" placeholder="Search for songs or artists…"
                                           value={search} onChange={(e) => setSearch(e.target.value)}
                                           className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] text-white text-sm outline-none border border-white/[0.08] focus:border-[#EE10B0]/60 transition placeholder-gray-600"
                                    />
                                </div>
                                {search && (
                                    <div className="absolute z-50 mt-2 w-full max-h-[360px] overflow-y-auto rounded-2xl shadow-2xl border border-white/[0.08]"
                                         style={{ background: "rgba(20,20,20,0.97)", backdropFilter: "blur(20px)" }}>
                                        {isLoading ? (
                                            <div className="flex items-center justify-center p-8">
                                                <div className="w-5 h-5 border-2 border-[#EE10B0] border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : data?.recordings?.length > 0 ? (
                                            data.recordings.map((recording: Recording) => (
                                                <button key={recording.id} type="button"
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition border-b border-white/[0.04] last:border-b-0 text-left"
                                                        onClick={() => handleAddTrackToPlaylist(activePlaylist.id, mapRecordingToTrack(recording))}
                                                >
                                                    {recording.cover && (
                                                        <img src={recording.cover} className="w-10 h-10 rounded-lg object-cover shrink-0" alt={recording.title} />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-white truncate">{recording.title}</p>
                                                        <p className="text-xs text-gray-500 truncate">{recording.artist ?? "Unknown"}</p>
                                                    </div>
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                                         style={{ background: "rgba(238,16,176,0.15)" }}>
                                                        <svg className="w-3.5 h-3.5 text-[#EE10B0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                                                        </svg>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-600">
                                                <p className="text-sm">No results for "{search}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Tracks list */}
                            <div>
                                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-600 mb-4">
                                    Tracks{" "}
                                    <span style={{ color: "#EE10B0" }}>({activePlaylist.tracks.length})</span>
                                </p>
                                {activePlaylist.tracks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-white/[0.04]">
                                        <span className="text-4xl">🎶</span>
                                        <p className="text-gray-600 text-sm">No tracks yet — search above to add some</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1.5">
                                        {activePlaylist.tracks.map((track, i) => (
                                            <div key={`${track.id}-${i}`}
                                                 onClick={() => setSelectedTrack(track)}
                                                 className="group flex items-center gap-3 rounded-xl px-4 py-2.5 cursor-pointer transition-all duration-200 bg-gray-800 hover:bg-gray-700"
                                            >
                                                <span className="text-xs text-gray-600 w-5 text-center shrink-0 tabular-nums">{i + 1}</span>
                                                {track.cover ? (
                                                    <div className="relative shrink-0">
                                                        <img src={track.cover} className="w-10 h-10 rounded-lg object-cover" alt={track.title} />
                                                        <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                                                        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#EE10B0] transition-colors">
                                                        {track.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {typeof track.artist === "string" ? track.artist : track.artist?.name}
                                                        {activePlaylist.is_shared && track.addedBy && (
                                                            <span className="ml-2 text-gray-700">
                                                                · added by <span style={{ color: "#EE10B0" }}>{track.addedBy.username}</span>
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeTrackFromPlaylist(activePlaylist.id, track.id); }}
                                                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                                                    title="Remove track"
                                                >
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : playlists.length > 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center h-80 text-gray-700 gap-3">
                            <svg className="w-12 h-12 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <p className="text-sm">Select a playlist to get started</p>
                        </div>
                    ) : null}
                </div>
            </div>
            {/* ── Modals ── */}
            {selectedTrack && <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />}
            {deleteConfirm && (
                <DeleteConfirmModal
                    playlistName={deleteConfirm.name}
                    onConfirm={handleDeletePlaylist}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
            {showMembersModal && activePlaylist && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4"
                     onClick={() => setShowMembersModal(false)}>
                    <div className="rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/[0.08]"
                         style={{ background: "rgba(16,16,16,0.97)", backdropFilter: "blur(24px)" }}
                         onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Members <span className="text-gray-600">({activePlaylist.members.length})</span></h3>
                            <button onClick={() => setShowMembersModal(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.08] transition">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 mb-6">
                            {activePlaylist.members.map((m) => (
                                <div key={m.user_id} className="flex items-center justify-between rounded-xl p-3 bg-white/[0.03] border border-white/[0.05]">
                                    <div className="flex items-center gap-3">
                                        <img src={m.avatar_url || DEFAULT_AVATAR} alt={m.username}
                                             className="w-9 h-9 rounded-full object-cover"
                                             onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                        <div>
                                            <p className="text-sm font-semibold">{m.username}</p>
                                            {m.user_id === activePlaylist.owner_id && (
                                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#EE10B0" }}>Owner</p>
                                            )}
                                        </div>
                                    </div>
                                    {isOwnerOfActive && m.user_id !== session.user.id && (
                                        <button onClick={() => removeMemberFromPlaylist(activePlaylist.id, m.user_id)}
                                                className="text-xs text-gray-600 hover:text-red-400 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-400/30 transition">
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {isOwnerOfActive && availableFriends.length > 0 && (
                            <>
                                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-600 mb-3">Add Friends</p>
                                <div className="flex flex-col gap-2">
                                    {availableFriends.map((f) => (
                                        <div key={f.profile.id} className="flex items-center justify-between rounded-xl p-3 bg-white/[0.03] border border-white/[0.05]">
                                            <div className="flex items-center gap-3">
                                                <img src={f.profile.avatar_url || DEFAULT_AVATAR} alt={f.profile.username}
                                                     className="w-9 h-9 rounded-full object-cover"
                                                     onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                                <span className="text-sm font-medium">{f.profile.username}</span>
                                            </div>
                                            <button onClick={() => handleAddMember(activePlaylist.id, f.profile.id, f.profile.username)}
                                                    className="px-4 py-1.5 rounded-lg text-sm font-bold transition hover:shadow-md hover:shadow-[#EE10B0]/20"
                                                    style={{ background: "linear-gradient(135deg, #EE10B0, #a855f7)" }}>
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {isOwnerOfActive && availableFriends.length === 0 && friends.length > 0 && (
                            <p className="text-sm text-gray-600 text-center py-4">All friends are already in this playlist</p>
                        )}
                        {isOwnerOfActive && friends.length === 0 && (
                            <p className="text-sm text-gray-600 text-center py-4">Add friends to share playlists with them</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}