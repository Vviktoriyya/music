import {type ReactNode, useState} from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {FavoritesProvider} from "../pages/favorites/context/FavoritesContext.tsx";
import { PlaylistProvider } from "../pages/playlist/context/PlaylistContext.tsx";
import {PlayerProvider} from "../context/PlayerContext.tsx";
import MiniPlayer from "../components/MiniPlayer.tsx";
export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            <FavoritesProvider>
                <PlaylistProvider>
                    <PlayerProvider>
                        <BrowserRouter>
                            {children}
                            <MiniPlayer />
                        </BrowserRouter>
                    </PlayerProvider>
                </PlaylistProvider>
            </FavoritesProvider>
        </QueryClientProvider>
    );
}