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

    // Адаптація TopTrack[] до типу пропсу компонента TopTracks
    type UiTrack = ComponentProps<typeof TopTracks>["topTracks"][number];
    const uiTopTracks: UiTrack[] = (topTracks ?? []).map((t: any) => ({
        ...t,
        title: t.title ?? t.name ?? "",
        link: t.link ?? t.preview ?? "#",
    }));

    return (
        <div className="relative z-0 max-w-[1550px] flex flex-col pl-[70px] pt-[48px] overflow-hidden">
            <div className="flex justify-center pt-[100px]">
                <div className="relative w-[350px] h-[350px] z-10 artist-glow">
                    <img
                        src={artist.picture_xl || artist.picture_big || artist.picture}
                        alt={artist.name}
                        className="w-full h-full rounded-full relative z-10"
                    />
                </div>
            </div>

            <Header />

            <div className="absolute pt-[378px] border-b-4 w-full border-black pl-[44px] z-20 pointer-events-none">
                <h1 className="text-[96px] font-black text-white font-[Vazirmatn]">{artist.name}</h1>
            </div>

            {!loadingTracks && <TopTracks topTracks={uiTopTracks} />}
            <ArtistAlbums albums={albums} isLoading={loadingAlbums} />


        </div>
    );
};

export default Artists;