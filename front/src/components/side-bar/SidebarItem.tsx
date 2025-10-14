
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/superbaseClient";
import { useNavigate } from "react-router-dom";

interface SidebarItemProps {
    icon: string;
    text: string;
    isLogout?: boolean;
}

export default function SidebarItem({ icon, text, isLogout }: SidebarItemProps) {
    const { setSession } = useAuth();
    const navigate = useNavigate();

    const handleClick = async () => {
        if (isLogout) {
            await supabase.auth.signOut();
            setSession(null);
            navigate("/");
        }
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded"
        >
            <span>{icon}</span>
            <span>{text}</span>
        </button>
    );
}
