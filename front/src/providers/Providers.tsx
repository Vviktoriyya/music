import {type ReactNode, useState} from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {FavoritesProvider} from "../pages/favorites/context/FavoritesContext.tsx";

export default function Providers({ children }: { children: ReactNode }) {

    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <FavoritesProvider>
                <BrowserRouter>{children}</BrowserRouter>
            </FavoritesProvider>
        </QueryClientProvider>
    );
}