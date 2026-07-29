import Header from "../../components/header/Header.tsx";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { ComponentProps } from "react";
import type { Artist, TopTrack, ArtistAlbum } from "./artist/interfaces/artistTypes.ts";
import { getTopArtists } from "../../service/singerService.ts";
import TopTracks from "./artist/components/TopTracks.tsx";
import ArtistAlbums from "./artist/components/ArtistAlbum.tsx";
const fetchArtistTopTracks = async (artistId: number): Promise<TopTrack[]> => {
    const { data } = await axios.get(`http://localhost:5000/api/artist/${artistId}/top`);
    return data;
};
const fetchArtistAlbums = async (artistId: number): Promise<ArtistAlbum[]> => {
    const { data } = await axios.get(`http://localhost:5000/api/artist/${artistId}/albums`);
    return data;
};
const Artists = () => {
    const location = useLocation();
    const state = location.state as { artist?: Artist } | null;
    const [artist, setArtist] = useState<Artist | null>(state?.artist || null);
    const { data: topArtists } = useQuery({
        queryKey: ["topArtists"],
        queryFn: getTopArtists,
        staleTime: Infinity,
    });
    useEffect(() => {
        if (!artist && topArtists?.length) {
            setArtist(topArtists[Math.floor(Math.random() * topArtists.length)]);
        }
    }, [artist, topArtists]);
    const { data: topTracks = [], isLoading: loadingTracks } = useQuery({
        queryKey: ["artistTopTracks", artist?.id],
        queryFn: () => fetchArtistTopTracks(artist!.id),
        enabled: !!artist,
    });
    const { data: albums = [], isLoading: loadingAlbums } = useQuery({
        queryKey: ["artistAlbums", artist?.id],
        queryFn: () => fetchArtistAlbums(artist!.id),
        enabled: !!artist,
    });
    if (!artist) return <div className="text-white pl-10 pt-10">Loading artist...</div>;
    type UiTrack = ComponentProps<typeof TopTracks>["topTracks"][number];
    const uiTopTracks: UiTrack[] = (topTracks ?? []).map((t: any) => ({
        ...t,
        title: t.title ?? t.name ?? "",
        link: t.link ?? t.preview ?? "#",
    }));
    return (
        <div className="relative z-0 flex max-w-[1550px] flex-col overflow-hidden px-4 pb-12 pt-24 sm:px-6 lg:px-8 xl:pl-[70px] xl:pt-[48px]">
            <div className="flex justify-center pt-[70px] sm:pt-[100px]">
                <div className="relative z-10 h-[220px] w-[220px] artist-glow sm:h-[280px] sm:w-[280px] xl:h-[350px] xl:w-[350px]">
                    <img
                        src={artist.picture_xl || artist.picture_big || artist.picture}
                        alt={artist.name}
                        className="w-full h-full rounded-full relative z-10"
                    />
                </div>
            </div>
            <Header />
            <div className="pointer-events-none absolute left-0 right-0 top-[250px] z-20 border-b-4 border-black px-4 sm:top-[330px] sm:px-6 lg:px-8 xl:top-[378px] xl:pl-[44px]">
                <h1 className="font-[Vazirmatn] text-[42px] font-black text-white sm:text-[64px] xl:text-[96px]">{artist.name}</h1>
            </div>
            {!loadingTracks && <TopTracks topTracks={uiTopTracks} />}
            <ArtistAlbums albums={albums} isLoading={loadingAlbums} />
        </div>
    );
};
export default Artists;
