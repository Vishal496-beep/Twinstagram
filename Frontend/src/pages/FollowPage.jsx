import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Search, Users } from "lucide-react";
import UserCard from "../components/UserCard";

const FollowPage = () => {
    const { profileId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine if we are looking at followers or following based on the URL
    const isFollowersPath = location.pathname.includes("followers");
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchList = async () => {
        try {
            setLoading(true);
            const endpoint = isFollowersPath 
                ? `/follow/followers/${profileId}` 
                : `/follow/following/${profileId}`;
            
            const res = await api.get(endpoint);
            // Matching your controller's ApiResponse structure
            const data = isFollowersPath ? res.data.data.followers : res.data.data.following;
            setUsers(data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, [profileId, isFollowersPath]);

    const handleToggleFollow = async (id) => {
        await api.post(`/follow/c/${id}`);
        fetchList(); // Refresh to update button states
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <header className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-3 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-all border border-white/5">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter">
                                {isFollowersPath ? "Followers" : "Following"}
                            </h1>
                            <p className="text-[10px] font-bold text-indigo-500 tracking-[0.2em] uppercase">
                                Network Directory
                            </p>
                        </div>
                    </div>
                    <Users className="text-zinc-800" size={40} />
                </header>

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input 
                        className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500/50 transition-all"
                        placeholder="Search by name or handle..."
                        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                    />
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-zinc-900/50 animate-pulse rounded-4xl" />)}
                        </div>
                    ) : (
                        users.filter(item => {
                            const d = isFollowersPath ? item.followerDetails : item.followingDetails;
                            return d.fullname.toLowerCase().includes(searchTerm) || d.username.toLowerCase().includes(searchTerm);
                        }).map(item => {
                            const details = isFollowersPath ? item.followerDetails : item.followingDetails;
                            return (
                                <UserCard 
                                    key={item._id}
                                    userData={details}
                                    isMe={details._id === currentUser?._id}
                                    isFollowing={isFollowersPath ? true : true} // You can refine this logic based on your subscription model
                                    onToggleFollow={() => handleToggleFollow(details._id)}
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowPage;