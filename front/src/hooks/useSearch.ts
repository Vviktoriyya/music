import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { SearchData } from "../types/search.ts";

const fetchSearchResults = async (query: string): Promise<SearchData> => {
    if (!query) return { artists: [], recordings: [] };

    const { data } = await axios.get("/api/search/all", { params: { q: query } });

    const recordings = (data.tracks ?? []).map((track: any) => ({
        id: track.id,
        title: track.name ?? track.title,
        artist: track.artist ?? "Unknown",
        cover: track.cover ?? null,
        preview: track.preview ?? null,
        duration: track.duration,
        rank: track.rank,
    }));

    return {
        artists: data.artists ?? [],
        recordings,
    };
};

export function useSearch(search: string) {
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(handler);
    }, [search]);

    return useQuery<SearchData>({
        queryKey: ["search", debouncedSearch],
        queryFn: () => fetchSearchResults(debouncedSearch),
        enabled: !!debouncedSearch,
        initialData: { artists: [], recordings: [] },
    });
}
