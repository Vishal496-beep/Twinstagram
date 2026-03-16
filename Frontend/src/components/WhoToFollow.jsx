import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const WhoToFollow = ({ darkMode }) => {
    const { user: currentUser } = useAuth();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                setLoading(true);
                // Updated to use the /follow prefix as per your backend router
                const res = await api.get("/follow/suggestions");
                
                if (res.data.success) {
                    // Filter out current user and limit display
                    const filtered = res.data.data
                        .filter(u => u._id !== currentUser?._id)
                        .slice(0, 4);
                    setSuggestions(filtered);
                }
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?._id) {
            fetchSuggestions();
        }
    }, [currentUser?._id]);

    const handleFollowToggle = async (userId) => {
        try {
            // MATCHING BACKEND: router.route("/c/:profileId").post(toggleFollow);
            const res = await api.post(`/follow/c/${userId}`);
            
            if (res.data.success) {
                // Update local state to toggle the icon
                setSuggestions(prev => 
                    prev.map(u => u._id === userId 
                        ? { ...u, isSubscribed: res.data.data.isFollowing } 
                        : u
                    )
                );
            }
        } catch (err) {
            console.error("Follow action failed:", err);
        }
    };

    if (loading) return (
        <div className="p-6 space-y-4 animate-pulse">
            <div className="h-2 w-20 bg-zinc-800 rounded mb-6" />
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                        <div className="h-2 bg-zinc-800 rounded w-1/2" />
                        <div className="h-2 bg-zinc-800 rounded w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );

    if (suggestions.length === 0) return null;

    return (
        <div className={`rounded-[2.5rem] border overflow-hidden mt-6 transition-all duration-300 ${
            darkMode ? "bg-zinc-950 border-white/5" : "bg-white border-zinc-200 shadow-sm"
        }`}>
            <div className="p-6 pb-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">
                    Who to Follow
                </h3>
            </div>

            <div className="px-3 pb-3 space-y-1">
                {suggestions.map((user) => (
                    <div 
                        key={user._id} 
                        className={`flex items-center justify-between p-3 rounded-3xl transition-all group ${
                            darkMode ? "hover:bg-white/5" : "hover:bg-zinc-50"
                        }`}
                    >
                        <Link to={`/profile/${user.username}`} className="flex items-center gap-3 min-w-0">
                            <div className="relative">
                                <img 
                                    src={user.avatar} 
                                    alt={user.username} 
                                    className="w-11 h-11 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500/50 transition-all"
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-black truncate group-hover:text-indigo-400 transition-colors">
                                    {user.fullname}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-bold truncate">
                                    @{user.username}
                                </span>
                            </div>
                        </Link>

                        <button 
                            onClick={() => handleFollowToggle(user._id)}
                            className={`p-2.5 rounded-2xl transition-all active:scale-95 ${
                                user.isSubscribed 
                                ? "text-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/20" 
                                : darkMode 
                                    ? "text-white bg-zinc-900 hover:bg-zinc-800" 
                                    : "text-black bg-zinc-100 hover:bg-zinc-200"
                            }`}
                        >
                            {user.isSubscribed ? <UserCheck size={18} /> : <UserPlus size={18} />}
                        </button>
                    </div>
                ))}
            </div>

            <Link 
                to="/search" 
                className={`block w-full text-center py-5 text-[9px] font-black uppercase tracking-[0.2em] transition-colors border-t ${
                    darkMode ? "text-zinc-600 hover:text-white border-white/5 hover:bg-white/5" : "text-zinc-400 hover:text-black border-zinc-100 hover:bg-zinc-50"
                }`}
            >
                Discover Creators
            </Link>
        </div>
    );
};

export default WhoToFollow;