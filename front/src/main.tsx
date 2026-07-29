import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileProvider.tsx";
const queryClient = new QueryClient();
const originalError = console.error;
console.error = (...args: any[]) => {
    if (args[0]?.toString?.().includes?.("Encountered two children with the same key")) {
        return;
    }
    originalError(...args);
};
ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <ProfileProvider>
                <App />
            </ProfileProvider>
        </AuthProvider>
    </QueryClientProvider>
);