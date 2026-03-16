import { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const UserListModal = ({ isOpen, onClose, profileId, type, darkMode }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && profileId) {
            const fetchUsers = async () => {
                setLoading(true);
                try {
                    // Endpoint construction based on your backend follow.routes.js
                    // Note: '/follow' prefix comes from app.use("/api/v1/follow", followRouter)
                    const endpoint = type === 'followers' 
                        ? `/follow/followers/${profileId}` 
                        : `/follow/following/${profileId}`;
                    
                    const res = await api.get(endpoint);
                    
                    // Accessing data based on your getUserChannelFollowers/getFollowingChannels logic
                    const data = type === 'followers' 
                        ? res.data.data.followers 
                        : res.data.data.following;
                    
                    setUsers(data || []);
                } catch (err) {
                    console.error(`Error fetching ${type}:`, err);
                    setUsers([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [isOpen, profileId, type]);

    if (!isOpen) return null;

    // Prevent background scrolling when modal is open
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div 
            onClick={handleBackdropClick}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
            <div className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border transition-all animate-in fade-in zoom-in duration-200 ${
                darkMode ? 'bg-zinc-950 border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900'
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-500/10">
                    <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-indigo-500">
                        {type}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-500/10 rounded-full transition-colors text-zinc-500">
                        <X size={20} />
                    </button>
                </div>

                {/* List Content */}
                <div className="max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
                    {loading ? (
                        <div className="p-12 text-center flex flex-col items-center gap-3">
                            <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Syncing Network</p>
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-1">
                            {users.map((item) => {
                                // Extract details from the aggregate pipeline structure
                                const person = type === 'followers' ? item.followerDetails : item.followingDetails;
                                
                                return (
                                    <Link 
                                        key={item._id} 
                                        to={`/profile/${person?.username}`}
                                        onClick={onClose}
                                        className={`flex items-center gap-4 p-3 rounded-2xl transition-all group ${
                                            darkMode ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            {person?.avatar ? (
                                                <img 
                                                    src={person.avatar} 
                                                    className="w-11 h-11 rounded-full object-cover border border-zinc-500/20 group-hover:border-indigo-500/50 transition-colors" 
                                                    alt={person?.username}
                                                />
                                            ) : (
                                                <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center">
                                                    <User size={20} className="text-zinc-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold leading-none truncate group-hover:text-indigo-400 transition-colors">
                                                {person?.fullname}
                                            </p>
                                            <p className="text-[11px] text-zinc-500 mt-1 truncate">@{person?.username}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 opacity-50">
                                No {type} discovered
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-500/5 text-center">
                    <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-tighter italic">
                        Explore more creators to grow your network
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserListModal;