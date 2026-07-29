import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.ts";
import { useAuth } from "../context/AuthContext.tsx";
export interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
}
export function useProfile() {
    const { session } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const fetchProfile = useCallback(async (): Promise<void> => {
        if (!session?.user) {
            setProfile(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();
            if (error) {
                console.error("Error fetching profile:", error.message);
                setProfile(null);
            } else {
                setProfile(data as Profile);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id]);
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    const updateProfile = async (updates: {
        username?: string;
        bio?: string;
        avatar_url?: string;
    }): Promise<{ success: boolean; error?: string }> => {
        if (!session?.user) {
            return { success: false, error: "Not authenticated" };
        }
        try {
            const { error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", session.user.id);
            if (error) {
                if (error.code === "23505") {
                    return { success: false, error: "This username is already taken" };
                }
                return { success: false, error: error.message };
            }
            await fetchProfile();
            return { success: true };
        } catch (err) {
            console.error("Error updating profile:", err);
            return { success: false, error: "Failed to update profile" };
        }
    };
    const uploadAvatar = async (
        file: File
    ): Promise<{ success: boolean; error?: string; url?: string }> => {
        if (!session?.user) {
            return { success: false, error: "Not authenticated" };
        }
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(fileName, file, { upsert: true });
            if (uploadError) {
                return { success: false, error: uploadError.message };
            }
            const { data: publicData } = supabase.storage
                .from("avatars")
                .getPublicUrl(fileName);
            const publicUrl = publicData.publicUrl;
            const result = await updateProfile({ avatar_url: publicUrl });
            if (!result.success) {
                return { success: false, error: result.error };
            }
            return { success: true, url: publicUrl };
        } catch (err) {
            console.error("Error uploading avatar:", err);
            return { success: false, error: "Failed to upload avatar" };
        }
    };
    return { profile, loading, updateProfile, uploadAvatar, refetch: fetchProfile };
}