import type { ReactNode } from "react";
import { useProfile } from "../hooks/useProfile.ts";
import { ProfileContext } from "./ProfileContext.tsx";
export function ProfileProvider({ children }: { children: ReactNode }) {
    const value = useProfile();
    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}