import { createContext, useContext } from "react";
import type { useProfile } from "../hooks/useProfile.ts";
import type { Profile } from "../hooks/useProfile.ts";
export interface ProfileContextValue {
    profile: Profile | null;
    loading: boolean;
    updateProfile: ReturnType<typeof useProfile>["updateProfile"];
    uploadAvatar: ReturnType<typeof useProfile>["uploadAvatar"];
    refetch: () => Promise<void>;
}
export const ProfileContext = createContext<ProfileContextValue | null>(null);
export function useProfileContext() {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error("useProfileContext must be used inside ProfileProvider");
    return ctx;
}