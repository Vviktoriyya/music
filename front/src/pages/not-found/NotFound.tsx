import { Link } from "react-router";
import Header from "../../components/header/Header.tsx";

export default function NotFound() {
    return (
        <div className="relative min-h-screen flex flex-col bg-[#0a0a0a]">
            <Header />

            <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
                <h1 className="text-8xl font-syne font-extrabold mb-4 text-white
                               drop-shadow-[0_0_30px_rgba(238,16,176,0.9)]
                               animate-neon-glow">
                    404
                </h1>

                <h2 className="text-2xl font-semibold text-gray-200 mb-2">
                    Page Not Found
                </h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    Sorry, the page you are looking for does not exist or has been moved.
                </p>

                <Link
                    to="/"
                    className="px-8 py-4 rounded-3xl bg-[#181818] text-white font-bold text-lg
                               shadow-lg drop-shadow-[0_0_20px_rgba(238,16,176,0.7)]
                               hover:scale-105 hover:shadow-2xl hover:drop-shadow-[0_0_30px_rgba(238,16,176,0.9)]
                               transition-all duration-300 animate-pulse-btn"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
