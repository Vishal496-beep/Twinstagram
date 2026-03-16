import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import { 
    Film, Info, Twitter, Loader2, UserPlus, 
    UserMinus, Heart, Link as LinkIcon 
} from "lucide-react";

// Video Preview Sub-Component
const VideoPreviewCard = ({ video }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link 
            to={`/v/${video._id}`} 
            className="group relative block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="aspect-video bg-zinc-900 rounded-[2rem] overflow-hidden relative border border-white/5 shadow-xl transition-all duration-500 group-hover:shadow-indigo-500/10 group-hover:-translate-y-1">
                {/* Static Thumbnail */}
                <img 
                    src={video.thumbnail} 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`} 
                    alt={video.title} 
                />

                {/* Video Preview (Plays on Hover) */}
                {isHovered && (
                    <video
                        src={video.videoFile}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-white font-bold text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {video.title}
                    </h3>
                    <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mt-1">
                        {video.views} Views • {video.duration ? `${Math.floor(video.duration)}s` : 'HD'}
                    </p>
                </div>
            </div>
        </Link>
    );
};

const UserProfile = () => {
    const { username } = useParams(); 
    const [user, setUser] = useState(null);
    const [content, setContent] = useState([]);
    const [activeTab, setActiveTab] = useState("videos");
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/users/c/${username}`);
                setUser(res.data.data);
            } catch (err) {
                console.error("Profile Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        if (username) fetchProfile();
    }, [username]);

    useEffect(() => {
        const fetchContent = async () => {
            if (!user?._id) return;
            try {
                let res;
                if (activeTab === "videos") {
                    res = await api.get(`/video?userId=${user._id}`);
                    setContent(res.data.data.docs || []);
                } else if (activeTab === "tweets") {
                    res = await api.get(`/tweet/user/${user._id}`);
                    setContent(res.data.data || []);
                }
            } catch (err) {
                setContent([]);
            }
        };
        fetchContent();
    }, [user?._id, activeTab]);

    const handleFollowToggle = async () => {
        if (!user?._id) return;
        try {
            setFollowLoading(true);
            // FIXED: Matches router.route("/c/:profileId")
            await api.post(`/follow/c/${user._id}`); 

            setUser(prev => ({
                ...prev,
                isSubscribed: !prev.isSubscribed,
                followersCount: prev.isSubscribed ? prev.followersCount - 1 : prev.followersCount + 1
            }));
        } catch (err) {
            console.error("Follow toggle failed:", err);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Syncing Profile...</span>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Profile Header */}
            <div className="relative mb-12 p-8 rounded-[3rem] bg-gradient-to-br from-zinc-900/50 to-black border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10" />
                <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                    <div className="relative group">
                        <img 
                            src={user?.avatar} 
                            className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-black shadow-2xl transition-transform group-hover:scale-105" 
                            alt={user?.username} 
                        />
                        <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-white/20" />
                    </div>

                    <div className="flex-1 text-center md:text-left pb-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                                {user?.fullname}
                            </h1>
                            <button 
                                onClick={handleFollowToggle} 
                                disabled={followLoading}
                                className={`min-w-[140px] flex items-center justify-center gap-2 px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                    user?.isSubscribed 
                                    ? "bg-zinc-800 text-zinc-400 border border-white/5 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20" 
                                    : "bg-white text-black hover:bg-indigo-500 hover:text-white"
                                }`}
                            >
                                {followLoading ? <Loader2 size={14} className="animate-spin" /> : 
                                 user?.isSubscribed ? <><UserMinus size={14}/> Unfollow</> : <><UserPlus size={14}/> Follow</>}
                            </button>
                        </div>
                        <p className="text-indigo-400 font-bold mb-6">@{user?.username}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-8">
                            <StatItem label="Followers" value={user?.followersCount} />
                            <StatItem label="Following" value={user?.followingCount} />
                            <StatItem label="Visions" value={user?.videosCount || 0} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center justify-center gap-4 mb-12">
                <TabButton active={activeTab === "videos"} onClick={() => setActiveTab("videos")} icon={<Film size={14}/>} label="Visions" />
                <TabButton active={activeTab === "tweets"} onClick={() => setActiveTab("tweets")} icon={<Twitter size={14}/>} label="Tweets" />
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === "videos" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {content.map((video) => (
                            <VideoPreviewCard key={video._id} video={video} />
                        ))}
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 gap-6 space-y-6 max-w-5xl mx-auto">
                        {content.map((tweet) => (
                            <div key={tweet._id} className="break-inside-avoid bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] hover:border-indigo-500/30 transition-all group">
                                <p className="text-zinc-200 text-sm leading-relaxed mb-6">{tweet.content}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-4 text-zinc-500">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black"><Heart size={14}/> {tweet.likesCount || 0}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                            {new Date(tweet.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {content.length === 0 && (
                    <div className="py-32 text-center">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 text-zinc-700">
                            <Info size={24} />
                        </div>
                        <p className="font-black text-[10px] uppercase tracking-[0.4em] text-zinc-600">This sector is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatItem = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-white font-black text-2xl tracking-tighter italic leading-none">{value || 0}</span>
        <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1">{label}</span>
    </div>
);

const TabButton = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-8 py-3 rounded-2xl transition-all border ${active ? "bg-white text-black border-white shadow-lg" : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"}`}>
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

export default UserProfile;