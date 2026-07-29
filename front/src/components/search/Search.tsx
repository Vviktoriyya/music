import { useState, useRef, useEffect, useCallback } from "react";
import { useSearch } from "../../hooks/useSearch.ts";
import { useNavigate } from "react-router-dom";
import type { Artist, Recording } from "../../types/search.ts";
import type { Track } from "../../types/track.ts";
import { usePlayer } from "../../context/PlayerContext.tsx";
export default function Search() {
    const [search, setSearch] = useState("");
    const { data, isLoading } = useSearch(search);
    const navigate = useNavigate();
    const { playTrack } = usePlayer();
    const [isSearchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                if (window.innerWidth < 1280) setSearchOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    useEffect(() => {
        if (isSearchOpen) inputRef.current?.focus();
    }, [isSearchOpen]);
    const handleArtistClick = useCallback((artist: Artist) => {
        setSearch("");
        setSearchOpen(false);
        navigate(`/artists/${artist.id}`, { state: { artistName: artist.name } });
    }, [navigate]);
    const handleTrackClick = useCallback((recording: Recording) => {
        const trackData: Track = {
            id: recording.id, name: recording.title, title: recording.title,
            artist: { id: "0", name: recording.artist ?? "Unknown" },
            link: recording.link ?? "", duration: recording.duration ?? 0, rank: recording.rank ?? 0,
            cover: recording.cover ?? undefined,
            album: { id: 0, title: recording.title, link: recording.link ?? "", cover: recording.cover ?? "", release_date: recording.releaseDate ?? undefined },
            preview: recording.preview ?? null, full: recording.full ?? null, release_date: recording.releaseDate ?? undefined,
        };
        playTrack(trackData);
        setSearchOpen(false);
        setSearch("");
    }, [playTrack]);
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") { setSearch(""); setSearchOpen(false); }
    }, []);
    const SearchResults = () => (
        <>
            {isLoading && <p className="p-2 text-white">Loading...</p>}
            {!isLoading && data && data.artists.length === 0 && data.recordings.length === 0 && (
                <p className="p-2 text-white">No results</p>
            )}
            {!isLoading && data && (
                <>
                    {data.artists.map((artist: Artist) => (
                        <div key={artist.id} className="p-2 text-white cursor-pointer hover:bg-[#222222] flex items-center gap-2" onClick={() => handleArtistClick(artist)}>
                            👤 <span className="font-medium">{artist.name}</span>
                        </div>
                    ))}
                    {data.recordings.map((recording: Recording) => (
                        <div key={recording.id} className="p-2 text-white cursor-pointer hover:bg-[#333333] flex items-center gap-2" onClick={() => handleTrackClick(recording)}>
                            {recording.cover && <img src={recording.cover} alt={recording.title} className="w-10 h-10 rounded-md" />}
                            <div className="flex flex-col">
                                <span className="font-medium">{recording.title}</span>
                                <span className="text-gray-400 text-sm">{recording.artist ?? "Unknown"}</span>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </>
    );
    return (
        <div className="relative flex flex-col items-start xl:pl-[30px]" ref={searchRef}>
            <div className="hidden xl:block xl:w-[340px] min-[1310px]:xl:w-[386px]">
                <div className="h-[48px] flex flex-row justify-start items-center gap-[5px] px-[8px] rounded-[10px] bg-[#1f1f1f]">
                    <img src="/assets/icon/search.png" alt="Search" className="w-[25px] h-[25px]" />
                    <input type="text" placeholder="Search For Musics, Artists, ..." className="bg-transparent outline-none text-white text-sm w-full" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown} autoComplete="off" />
                </div>
                {search && (
                    <div className="absolute z-50 mt-2 w-full min-w-[336px] max-h-[300px] overflow-y-auto rounded-lg bg-[#2a2a2a] shadow-lg pink-scroll">
                        <SearchResults />
                    </div>
                )}
            </div>
            <div className="xl:hidden">
                <button onClick={() => setSearchOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f]">
                    <img src="/assets/icon/lookFor.png" alt="Search" className="w-[25px] h-[25px]" />
                </button>
                {isSearchOpen && (
                    <div className="absolute left-0 top-0 z-50 flex w-[min(86vw,386px)] flex-col items-center">
                        <div className="w-full h-[48px] flex flex-row justify-start items-center gap-[5px] px-[8px] rounded-[10px] bg-[#1f1f1f]">
                            <img src="/assets/icon/lookFor.png" alt="Search" className="w-[25px] h-[25px]" />
                            <input ref={inputRef} type="text" placeholder="Search For Musics, Artists, ..." className="bg-transparent outline-none text-white text-sm w-full" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown} autoComplete="off" />
                        </div>
                        {search && (
                            <div className="mt-2 max-h-[300px] w-full overflow-y-auto rounded-lg bg-[#2a2a2a] shadow-lg pink-scroll">
                                <SearchResults />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}