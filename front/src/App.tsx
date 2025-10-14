import { lazy, Suspense } from "react";
import { Routes, type RouteObject, Route } from "react-router-dom";
import Providers from "./providers/Providers";
import Preloader from "./components/Preloader";
import Favorites from "./pages/favorites/Favorites.tsx";
import AlbumPage from "./pages/album/AlbumPage.tsx";
import PlaylistPage from "./pages/album/PlaylistPage.tsx";

// Ліниві імпорти сторінок/лайаута
const AppLayout = lazy(() => import("./layout/AppLayout"));
const MainContent = lazy(() => import("./pages/contentHome/MainContent.tsx"));
const Discover = lazy(() => import("./pages/Discover/Discover"));
const Artists = lazy(() => import("./pages/artists/Artists.tsx"));
const ArtistId = lazy(() => import("./pages/artists/ArtistId.tsx"));
const NotFound = lazy(() => import("./pages/not-found/NotFound.tsx"));
const AlbumId = lazy(() => import("./pages/album/AlbumId.tsx"));
const Album = lazy(() => import("./pages/album/Album.tsx"));


const routes: RouteObject[] = [
	{
		path: "/",
		element: <AppLayout />,
		children: [
			{ index: true, element: <MainContent /> },
			{ path: "discover", element: <Discover /> },
			{ path: "artists", element: <Artists /> },
			{ path: "artists/:id", element: <ArtistId /> },
			{ path: "favorites", element: <Favorites /> },
			{ path: "albums", element: <Album /> },
			{ path: "album/:id", element: <AlbumId /> },
			{ path: "albums/:id", element: <AlbumPage /> },
			{ path: "playlists/:id", element: <PlaylistPage  /> },
			{ path: "*", element: <NotFound /> },
		],
	},
];

function renderRoutes(items: RouteObject[]) {
	return items.map((route, i) => {
		if (route.index) {
			return <Route key={i} index element={route.element} />;
		}

		return (
			<Route key={i} path={route.path} element={route.element}>
				{route.children ? renderRoutes(route.children) : null}
			</Route>
		);
	});
}

export default function App() {
	return (
		<Providers>
			<Suspense fallback={<Preloader />}>
				<Routes>{renderRoutes(routes)}</Routes>
			</Suspense>
		</Providers>
	);
}
