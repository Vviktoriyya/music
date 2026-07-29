import { createContext, type ReactNode, useState, useEffect, useCallback } from "react";
import type { Track } from "../../../types/track.ts";
import { useAuth } from "../../../context/AuthContext.tsx";
import { supabase } from "../../../lib/supabaseClient.ts";
export interface PlaylistMember {
    user_id: string;
    username: string;
    avatar_url: string | null;
}
export interface PlaylistTrack extends Track {
    addedBy?: {
        userId: string;
        username: string;
    };
    addedAt?: string;
}
export interface Playlist {
    id: string;
    name: string;
    tracks: PlaylistTrack[];
    created_at: string;
    user_id: string;
    owner_id: string;
    is_shared: boolean;
    members: PlaylistMember[];
}
interface PlaylistContextType {
    playlists: Playlist[];
    createPlaylist: (name: string, isShared?: boolean) => Promise<string | null>;
    deletePlaylist: (id: string) => Promise<void>;
    addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
    removeTrackFromPlaylist: (playlistId: string, trackId: number | string) => Promise<void>;
    isTrackInPlaylist: (playlistId: string, trackId: number | string) => boolean;
    addMemberToPlaylist: (playlistId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
    removeMemberFromPlaylist: (playlistId: string, userId: string) => Promise<void>;
    leavePlaylist: (playlistId: string) => Promise<void>;
    loading: boolean;
    refetch: () => Promise<void>;
}
export const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);
export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useAuth();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(false);
    const fetchPlaylists = useCallback(async () => {
        if (!session) {
            setPlaylists([]);
            return;
        }
        setLoading(true);
        try {
            const { data: memberships, error: memberError } = await supabase
                .from("playlist_members")
                .select("playlist_id")
                .eq("user_id", session.user.id);
            if (memberError) {
                console.error("Error fetching memberships:", memberError.message);
                setLoading(false);
                return;
            }
            const playlistIds = (memberships || []).map((m) => m.playlist_id);
            let query = supabase.from("playlists").select("*");
            if (playlistIds.length > 0) {
                query = query.or(`user_id.eq.${session.user.id},id.in.(${playlistIds.join(",")})`);
            } else {
                query = query.eq("user_id", session.user.id);
            }
            const { data: playlistsData, error: plError } = await query.order("created_at", { ascending: false });
            if (plError) {
                console.error("Error fetching playlists:", plError.message);
                setLoading(false);
                return;
            }
            const playlistsWithMembers: Playlist[] = await Promise.all(
                (playlistsData || []).map(async (p) => {
                    const { data: membersData } = await supabase
                        .from("playlist_members")
                        .select("user_id")
                        .eq("playlist_id", p.id);
                    let members: PlaylistMember[] = [];
                    if (membersData && membersData.length > 0) {
                        const ids = membersData.map((m) => m.user_id);
                        const { data: profilesData } = await supabase
                            .from("profiles")
                            .select("id, username, avatar_url")
                            .in("id", ids);
                        members = (profilesData || []).map((pr) => ({
                            user_id: pr.id,
                            username: pr.username,
                            avatar_url: pr.avatar_url,
                        }));
                    }
                    return {
                        id: p.id,
                        name: p.name,
                        created_at: p.created_at,
                        user_id: p.user_id,
                        owner_id: p.owner_id || p.user_id,
                        is_shared: !!p.is_shared,
                        tracks: Array.isArray(p.tracks)
                            ? p.tracks
                            : typeof p.tracks === "string"
                                ? JSON.parse(p.tracks)
                                : [],
                        members,
                    };
                })
            );
            setPlaylists(playlistsWithMembers);
        } catch (err) {
            console.error("Error in fetchPlaylists:", err);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id]);
    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);
    const createPlaylist = async (name: string, isShared = false): Promise<string | null> => {
        if (!session) {
            alert("Please log in first");
            return null;
        }
        const { data, error } = await supabase
            .from("playlists")
            .insert({
                user_id: session.user.id,
                owner_id: session.user.id,
                is_shared: isShared,
                name,
                tracks: [],
            })
            .select()
            .single();
        if (error) {
            console.error("Error creating playlist:", error.message);
            return null;
        }
        await supabase.from("playlist_members").insert({
            playlist_id: data.id,
            user_id: session.user.id,
        });
        await fetchPlaylists();
        return data.id;
    };
    const deletePlaylist = async (id: string) => {
        if (!session) return;
        const { error } = await supabase
            .from("playlists")
            .delete()
            .eq("id", id);
        if (error) {
            console.error("Error deleting playlist:", error.message);
            return;
        }
        setPlaylists((prev) => prev.filter((p) => p.id !== id));
    };
    const addTrackToPlaylist = async (playlistId: string, track: Track) => {
        if (!session) return;
        const playlist = playlists.find((p) => p.id === playlistId);
        if (!playlist) return;
        if (playlist.tracks.some((t) => t.id === track.id)) return;
        const currentUsername =
            playlist.members.find((m) => m.user_id === session.user.id)?.username ||
            (session.user.user_metadata?.username as string) ||
            "Unknown";
        const enrichedTrack: PlaylistTrack = {
            ...track,
            addedBy: {
                userId: session.user.id,
                username: currentUsername,
            },
            addedAt: new Date().toISOString(),
        };
        const updatedTracks = [...playlist.tracks, enrichedTrack];
        const { error } = await supabase
            .from("playlists")
            .update({ tracks: updatedTracks })
            .eq("id", playlistId);
        if (error) {
            console.error("Error adding track:", error.message);
            return;
        }
        setPlaylists((prev) =>
            prev.map((p) =>
                p.id === playlistId ? { ...p, tracks: updatedTracks } : p
            )
        );
    };
    const removeTrackFromPlaylist = async (playlistId: string, trackId: number | string) => {
        if (!session) return;
        const playlist = playlists.find((p) => p.id === playlistId);
        if (!playlist) return;
        const updatedTracks = playlist.tracks.filter((t) => t.id !== trackId);
        const { error } = await supabase
            .from("playlists")
            .update({ tracks: updatedTracks })
            .eq("id", playlistId);
        if (error) {
            console.error("Error removing track:", error.message);
            return;
        }
        setPlaylists((prev) =>
            prev.map((p) =>
                p.id === playlistId ? { ...p, tracks: updatedTracks } : p
            )
        );
    };
    const isTrackInPlaylist = (playlistId: string, trackId: number | string) => {
        const playlist = playlists.find((p) => p.id === playlistId);
        return playlist?.tracks.some((t) => t.id === trackId) ?? false;
    };
    const addMemberToPlaylist = async (
        playlistId: string,
        userId: string
    ): Promise<{ success: boolean; error?: string }> => {
        if (!session) return { success: false, error: "Not authenticated" };
        try {
            const { error } = await supabase.from("playlist_members").insert({
                playlist_id: playlistId,
                user_id: userId,
            });
            if (error) {
                if (error.code === "23505" || (error as any).status === 409) {
                    return { success: false, error: "User is already a member" };
                }
                return { success: false, error: error.message };
            }
            const { data: profile } = await supabase
                .from("profiles")
                .select("id, username, avatar_url")
                .eq("id", userId)
                .single();
            if (profile) {
                setPlaylists((prev) =>
                    prev.map((p) =>
                        p.id === playlistId
                            ? {
                                ...p,
                                members: [
                                    ...p.members,
                                    {
                                        user_id: profile.id,
                                        username: profile.username,
                                        avatar_url: profile.avatar_url,
                                    },
                                ],
                            }
                            : p
                    )
                );
            }
            return { success: true };
        } catch (err) {
            console.error("Error adding member:", err);
            return { success: false, error: "Failed to add member" };
        }
    };
    const removeMemberFromPlaylist = async (playlistId: string, userId: string) => {
        if (!session) return;
        const { error } = await supabase
            .from("playlist_members")
            .delete()
            .eq("playlist_id", playlistId)
            .eq("user_id", userId);
        if (error) {
            console.error("Error removing member:", error.message);
            return;
        }
        setPlaylists((prev) =>
            prev.map((p) =>
                p.id === playlistId
                    ? { ...p, members: p.members.filter((m) => m.user_id !== userId) }
                    : p
            )
        );
    };
    const leavePlaylist = async (playlistId: string) => {
        if (!session) return;
        const { error } = await supabase
            .from("playlist_members")
            .delete()
            .eq("playlist_id", playlistId)
            .eq("user_id", session.user.id);
        if (error) {
            console.error("Error leaving playlist:", error.message);
            return;
        }
        setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    };
    return (
        <PlaylistContext.Provider
            value={{
                playlists,
                createPlaylist,
                deletePlaylist,
                addTrackToPlaylist,
                removeTrackFromPlaylist,
                isTrackInPlaylist,
                addMemberToPlaylist,
                removeMemberFromPlaylist,
                leavePlaylist,
                loading,
                refetch: fetchPlaylists,
            }}
        >
            {children}
        </PlaylistContext.Provider>
    );
};