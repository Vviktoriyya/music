import express from "express";
import axios from "axios";
import cors from "cors";
import NodeCache from "node-cache";



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
const myCache = new NodeCache({ stdTTL: 3600 });


// --- Топ треків ---
app.get("/api/trending", async (req, res) => {
    const limit = Number(req.query.limit) || 20;
    const cacheKey = `trending-tracks-${limit}`;

    const cachedTracks = myCache.get(cacheKey);
    if (cachedTracks) {
        console.log(`🎯 Повертаємо тренди з кешу!`);
        return res.json(cachedTracks);
    }

    try {
        const { data } = await axios.get("https://api.deezer.com/chart/0/tracks", { params: { limit } });
        const tracks = (data.data ?? []).map((t: any) => ({
            id: t.id,
            name: t.title,
            title: t.title,
            artist: t.artist?.name ?? "Unknown",
            cover: t.album?.cover ?? null,
            preview: t.preview ?? null,
            duration: t.duration ?? 0,
            release_date: t.album?.release_date ?? new Date().toISOString(), // якщо немає, ставимо зараз
            rank: t.rank ?? 0,
        }));



        myCache.set(cacheKey, tracks);
        res.json(tracks);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch trending songs" });
    }
});

// --- Топ артистів ---
app.get("/api/top-artists", async (req, res) => {
    const cacheKey = "top-artists"; // ✅ Унікальний ключ

    const cachedArtists = myCache.get(cacheKey);
    if (cachedArtists) {
        console.log(`🎯 Повертаємо топ артистів з кешу!`);
        return res.json(cachedArtists);
    }

    try {
        const limit = 60;
        const { data } = await axios.get(`https://api.deezer.com/chart/0/artists?limit=${limit}`);
        const cyrillicRegex = /[А-Яа-яЁё]/;
        const artists = (data.data ?? [])
            .filter((a: any) => !cyrillicRegex.test(a.name))
            .map((a: any) => ({
                id: a.id,
                name: a.name,
                picture: a.picture_medium,
                link: a.link,
            }));

        myCache.set(cacheKey, artists);
        res.json(artists);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch top artists" });
    }
});

// --- Дані артиста ---
app.get("/api/artist/:id", async (req, res) => {
    const artistId = req.params.id;
    const cacheKey = `artist-details-${artistId}`;

    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
        console.log(`🎯 Повертаємо деталі артиста ${artistId} з кешу!`);
        return res.json(cachedData);
    }

    try {
        const { data: artist } = await axios.get(`https://api.deezer.com/artist/${artistId}`);
        const artistData = {
            id: artist.id,
            name: artist.name,
            picture: artist.picture_medium,
            picture_big: artist.picture_big,
            picture_xl: artist.picture_xl,
            link: artist.link,
        };

        myCache.set(cacheKey, artistData);

        res.json(artistData);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch artist" });
    }
});



// --- Універсальний пошук ---
app.get("/api/search/all", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    try {
        const [artistRes, trackRes] = await Promise.all([
            axios.get("https://api.deezer.com/search/artist", { params: { q: query, limit: 5 } }),
            axios.get("https://api.deezer.com/search/track", { params: { q: query, limit: 10 } })
        ]);

        const artists = (artistRes.data.data ?? []).map((a: any) => ({
            id: a.id,
            name: a.name,
            picture: a.picture_medium,
            type: 'artist'
        }));

        const tracks = (trackRes.data.data ?? []).map((t: any) => ({
            id: t.id,
            name: t.title,
            artist: t.artist?.name ?? "Unknown",
            cover: t.album?.cover_medium ?? null,
            preview: t.preview,
            type: 'track',
            duration: t.duration,
            rank: t.rank,
        }));

        res.json({ artists, tracks });

    } catch (err: any) {
        console.error("Search All Error:", err.message);
        res.status(500).json({ error: "Failed to fetch search results" });
    }
});


// --- Топ треки артиста ---
type DeezerArtist = {
    name?: string | null;
};

type DeezerAlbum = {
    id?: number;
    title?: string | null;
    cover?: string | null;
    cover_medium?: string | null;
    release_date?: string | null;
};

type DeezerTrack = {
    id: number;
    title: string;
    rank?: number | null;
    duration?: number | null;
    preview?: string | null;
    artist?: DeezerArtist | null;
    album?: DeezerAlbum | null;
};

type DeezerTopResponse = {
    data: DeezerTrack[];
};

type OutputTrack = {
    id: number;
    name: string;
    artist: string;
    album: string | null;
    cover: string | null;
    rank: number | null;
    duration: number | null;
    preview: string | null;
    release_date: string | null;
};

app.get("/api/artist/:id/top", async (req, res) => {
    const artistId = req.params.id;
    const cacheKey = `artist-top-${artistId}`;

    const cached = myCache.get<OutputTrack[]>(cacheKey);
    if (cached) {
        console.log(`🎯 Повертаємо дані для артиста ${artistId} з кешу!`);
        return res.json(cached);
    }

    console.log(`🚀 Робимо новий запит до API Deezer для артиста ${artistId}...`);
    try {
        const response = await axios.get<DeezerTopResponse>(
            `https://api.deezer.com/artist/${artistId}/top`,
            { params: { limit: 50 } }
        );

        const tracksData: DeezerTrack[] = Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const tracks: OutputTrack[] = await Promise.all(
            tracksData.map(async (track) => {
                let release_date: string | null =
                    track.album?.release_date ?? null;

                if (!release_date && track.album?.id) {
                    try {
                        const albumRes = await axios.get<{ release_date?: string | null }>(
                            `https://api.deezer.com/album/${track.album.id}`
                        );
                        release_date = albumRes.data?.release_date ?? null;
                    } catch {
                        release_date = null;
                    }
                }

                return {
                    id: track.id,
                    name: track.title,
                    artist: track.artist?.name ?? "Unknown",
                    album: track.album?.title ?? null,
                    cover: track.album?.cover_medium ?? track.album?.cover ?? null,
                    rank: track.rank ?? null,
                    duration: track.duration ?? null,
                    preview: track.preview ?? null,
                    release_date,
                };
            })
        );

        myCache.set(cacheKey, tracks);

        res.json(tracks);
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
            console.error(
                `Помилка від Deezer API: ${err.response.status} ${err.response.statusText}`
            );
            res
                .status(err.response.status)
                .json({ error: "Failed to fetch data from the provider API" });
        } else {
            const message =
                err instanceof Error ? err.message : String(err);
            console.error(message);
            res
                .status(500)
                .json({ error: "An internal server error occurred" });
        }
    }
});

// --- Топ альбомів ---
app.get("/api/top-albums", async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const cacheKey = `top-albums-${limit}`;

    const cachedAlbums = myCache.get(cacheKey);
    if (cachedAlbums) {
        console.log(`🎯 Повертаємо топ альбомів з кешу!`);
        return res.json(cachedAlbums);
    }

    try {
        const { data } = await axios.get("https://api.deezer.com/chart/0/albums", { params: { limit } });
        const albums = (data.data ?? []).map((a: any) => ({
            id: a.id,
            title: a.title,
            cover: a.cover_medium,
            artist: a.artist?.name ?? "Unknown",
            link: a.link,
        }));

        myCache.set(cacheKey, albums);
        res.json(albums);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch top albums" });
    }
});

// --- Альбоми артиста ---
type DeezerAlbumsResponse = {
    data: {
        id: number;
        title: string;
        cover: string;
        cover_medium: string;
        cover_big: string;
        release_date?: string;
    }[];
};

type OutputAlbum = {
    id: number;
    title: string;
    cover: string;
    release_date: string | null;
};


const getRandomAlbumId = () => {
    const minId = 100000;
    const maxId = 1500000;
    return Math.floor(Math.random() * (maxId - minId + 1)) + minId;
};

// --- НОВИЙ ЕНДПОІНТ ---
app.get("/api/album/random", async (req, res) => {
    let attempts = 0;
    const maxAttempts = 10;

    console.log("🚀 Починаємо пошук випадкового альбому...");

    while (attempts < maxAttempts) {
        attempts++;
        const randomId = getRandomAlbumId();
        const cacheKey = `album-details-${randomId}`;

        const cachedData = myCache.get(cacheKey);
        if (cachedData) {
            console.log(`🎯 [CACHE] Знайдено випадковий альбом ${randomId} у кеші! Спроба №${attempts}.`);
            return res.json(cachedData);
        }

        try {
            console.log(`🔍 [API] Шукаємо альбом з ID: ${randomId}. Спроба №${attempts}...`);
            const response = await axios.get(`https://api.deezer.com/album/${randomId}`);

            if (!response.data.error && response.data.tracks && response.data.tracks.data.length > 0) {
                myCache.set(cacheKey, response.data); // Кешуємо успішний результат
                console.log(`✅ [API] Успіх! Знайдено і закешовано альбом ${randomId}.`);
                return res.json(response.data);
            }
            console.log(`🟡 [API] Альбом ${randomId} не знайдено або він порожній. Пробуємо ще раз.`);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log(`🟡 [API] Альбом ${randomId} не існує (404). Пробуємо ще раз.`);
            } else {
                console.error(`🔥 [SERVER] Критична помилка під час пошуку альбому ${randomId}:`, error);
                return res.status(500).json({ error: "A critical error occurred while fetching a random album." });
            }
        }
    }

    // Якщо не змогли знайти альбом за N спроб
    console.error(`❌ [SERVER] Не вдалося знайти випадковий альбом за ${maxAttempts} спроб.`);
    res.status(500).json({ error: "Could not find a random album after multiple attempts." });
});

app.get("/api/artist/:id/albums", async (req, res) => {
    const artistId = req.params.id;
    const cacheKey = `artist-albums-${artistId}`;

    // 1️⃣ Кеш
    const cached = myCache.get<OutputAlbum[]>(cacheKey);
    if (cached) {
        console.log(`🎯 Повертаємо альбоми артиста ${artistId} з кешу!`);
        return res.json(cached);
    }

    try {
        console.log(`🚀 Отримуємо альбоми артиста ${artistId} з Deezer...`);
        const response = await axios.get<DeezerAlbumsResponse>(
            `https://api.deezer.com/artist/${artistId}/albums`
        );

        const albums = (response.data?.data ?? []).map((a) => ({
            id: a.id,
            title: a.title,
            cover: a.cover_medium || a.cover || "",
            release_date: a.release_date ?? null,
        }));

        // 2️⃣ Кешуємо
        myCache.set(cacheKey, albums);

        res.json(albums);
    } catch (err: any) {
        console.error(`Помилка при отриманні альбомів артиста ${artistId}:`, err.message);
        res.status(500).json({ error: "Failed to fetch artist albums" });
    }
});

app.get("/api/album/:id", async (req, res) => {
    const { id } = req.params;
    const cacheKey = `album-details-${id}`;

    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
        console.log(`✅ [CACHE] Повертаю альбом ${id} з кешу.`);
        return res.json(cachedData);
    }

    try {
        console.log(`🚀 [API] Роблю запит до Deezer для альбому ${id}...`);
        const response = await axios.get(`https://api.deezer.com/album/${id}`);

        if (response.data.error) {
            console.warn(`⚠️ [API] Deezer повернув помилку для альбому ${id}:`, response.data.error);
            return res.status(404).json({ error: "Album not found on Deezer" });
        }

        myCache.set(cacheKey, response.data);
        console.log(`✅ [API] Альбом ${id} успішно отримано і закешовано.`);

        res.json(response.data);

    } catch (error) {
        // ✅ ОСЬ ВИПРАВЛЕННЯ
        console.error(`🔥 [SERVER] Помилка при запиті до альбому ${id}:`, error);
        if (axios.isAxiosError(error) && error.response) {
            return res.status(error.response.status).json({ error: "Failed to fetch data from Deezer" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});


// --- Жанри ---
app.get("/api/genres", async (req, res) => {
    try {
        const { data } = await axios.get("https://api.deezer.com/genre");
        const genres = (data.data ?? []).filter((g: any) => g.id !== 0).map((g: any) => ({
            id: g.id,
            name: g.name,
            picture: g.picture_medium,
        }));
        res.json(genres);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch genres" });
    }
});

// --- Трекі по жанру ---

app.get("/api/genre/:id/tracks", async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const { data } = await axios.get(`https://api.deezer.com/chart/${req.params.id}/tracks`, { params: { limit } });
        const tracks = (data.data ?? []).map((t: any) => ({
            id: t.id,
            title: t.title,
            artist: t.artist?.name ?? "Unknown",
            album: t.album?.title ?? null,
            cover: t.album?.cover_medium ?? null,
            link: t.link,
            duration: t.duration,
            preview: t.preview,
            rank: t.rank,
        }));
        res.json(tracks);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch genre tracks" });
    }
});

// --- Настрій плейлисти ---
app.get("/api/mood-playlists", async (req, res) => {
    const limit = Number(req.query.limit) || 5;
    const cacheKey = `mood-playlists-${limit}`;

    const cachedPlaylists = myCache.get(cacheKey);
    if (cachedPlaylists) {
        console.log(`🎯 Повертаємо плейлисти настрою з кешу!`);
        return res.json(cachedPlaylists);
    }

    const playlists: any[] = [];
    const moodGenreMap: Record<string, number> = { happy: 132, chill: 152, party: 113, sad: 165, love: 116, concentration: 85 };

    await Promise.all(Object.values(moodGenreMap).map(async (genreId) => {
        try {
            const { data } = await axios.get(`https://api.deezer.com/editorial/${genreId}/charts`);
            const moodPlaylists = data?.playlists?.data?.slice(0, limit) ?? [];
            moodPlaylists.forEach((pl: any) => playlists.push({
                id: pl.id,
                cover: pl.picture_medium,
                link: pl.link,
            }));
        } catch (err) { console.warn(err); }
    }));

    myCache.set(cacheKey, playlists);
    res.json(playlists);
});

app.get("/api/playlists/:id", async (req, res) => {
    const { id } = req.params;
    const cacheKey = `playlist-details-${id}`;

    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
        console.log(`✅ [CACHE] Повертаю плейлист ${id} з кешу.`);
        return res.json(cachedData);
    }

    try {
        console.log(`🚀 [API] Роблю запит до Deezer для плейлиста ${id}...`);
        const { data } = await axios.get(`https://api.deezer.com/playlist/${id}`);

        if (data.error) {
            return res.status(404).json({ error: "Playlist not found on Deezer" });
        }

        myCache.set(cacheKey, data);
        console.log(`✅ [API] Плейлист ${id} успішно отримано і закешовано.`);
        res.json(data);

    } catch (error) {
        console.error(`🔥 [SERVER] Помилка при запиті до плейлиста ${id}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
