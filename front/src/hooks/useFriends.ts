import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.ts";
import { useAuth } from "../context/AuthContext.tsx";
import type { Profile } from "./useProfile.ts";
export interface Friendship {
    id: string;
    requester_id: string;
    addressee_id: string;
    status: "pending" | "accepted";
    created_at: string;
}
export interface FriendWithProfile {
    friendshipId: string;
    profile: Profile;
    status: "pending" | "accepted";
    direction: "outgoing" | "incoming";
}
export function useFriends() {
    const { session } = useAuth();
    const [friends, setFriends] = useState<FriendWithProfile[]>([]);
    const [pendingIncoming, setPendingIncoming] = useState<FriendWithProfile[]>([]);
    const [pendingOutgoing, setPendingOutgoing] = useState<FriendWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchFriends = useCallback(async (): Promise<void> => {
        if (!session?.user) {
            setFriends([]);
            setPendingIncoming([]);
            setPendingOutgoing([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const userId = session.user.id;
        try {
            const { data: friendships, error } = await supabase
                .from("friendships")
                .select("*")
                .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
            if (error) {
                console.error("Error fetching friendships:", error.message);
                setLoading(false);
                return;
            }
            if (!friendships || friendships.length === 0) {
                setFriends([]);
                setPendingIncoming([]);
                setPendingOutgoing([]);
                setLoading(false);
                return;
            }
            const otherIds = friendships.map((f: Friendship) =>
                f.requester_id === userId ? f.addressee_id : f.requester_id
            );
            const { data: profiles, error: profilesError } = await supabase
                .from("profiles")
                .select("*")
                .in("id", otherIds);
            if (profilesError) {
                console.error("Error fetching profiles:", profilesError.message);
                setLoading(false);
                return;
            }
            const profileMap = new Map<string, Profile>(
                (profiles || []).map((p: Profile) => [p.id, p])
            );
            const accepted: FriendWithProfile[] = [];
            const incoming: FriendWithProfile[] = [];
            const outgoing: FriendWithProfile[] = [];
            friendships.forEach((f: Friendship) => {
                const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id;
                const profile = profileMap.get(otherId);
                if (!profile) return;
                const direction: "outgoing" | "incoming" =
                    f.requester_id === userId ? "outgoing" : "incoming";
                const item: FriendWithProfile = {
                    friendshipId: f.id,
                    profile,
                    status: f.status,
                    direction,
                };
                if (f.status === "accepted") {
                    accepted.push(item);
                } else if (direction === "incoming") {
                    incoming.push(item);
                } else {
                    outgoing.push(item);
                }
            });
            setFriends(accepted);
            setPendingIncoming(incoming);
            setPendingOutgoing(outgoing);
        } catch (err) {
            console.error("Error fetching friends:", err);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id]);
    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);
    const sendFriendRequest = async (
        addresseeId: string
    ): Promise<{ success: boolean; error?: string }> => {
        if (!session?.user) return { success: false, error: "Not authenticated" };
        if (addresseeId === session.user.id) {
            return { success: false, error: "You cannot add yourself" };
        }
        try {
            const { error } = await supabase.from("friendships").insert({
                requester_id: session.user.id,
                addressee_id: addresseeId,
                status: "pending",
            });
            if (error) {
                if (error.code === "23505") {
                    return { success: false, error: "Request already sent" };
                }
                return { success: false, error: error.message };
            }
            await fetchFriends();
            return { success: true };
        } catch (err) {
            console.error("Error sending request:", err);
            return { success: false, error: "Failed to send request" };
        }
    };
    const acceptFriendRequest = async (
        friendshipId: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error } = await supabase
                .from("friendships")
                .update({ status: "accepted" })
                .eq("id", friendshipId);
            if (error) return { success: false, error: error.message };
            await fetchFriends();
            return { success: true };
        } catch (err) {
            console.error("Error accepting request:", err);
            return { success: false, error: "Failed to accept request" };
        }
    };
    const removeFriend = async (
        friendshipId: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error } = await supabase
                .from("friendships")
                .delete()
                .eq("id", friendshipId);
            if (error) return { success: false, error: error.message };
            await fetchFriends();
            return { success: true };
        } catch (err) {
            console.error("Error removing friend:", err);
            return { success: false, error: "Failed to remove friend" };
        }
    };
    return {
        friends,
        pendingIncoming,
        pendingOutgoing,
        loading,
        sendFriendRequest,
        acceptFriendRequest,
        removeFriend,
        refetch: fetchFriends,
    };
}