import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import CommentSection from "../components/CommentSection.jsx";
import { ThumbsUp, Share2, UserPlus, UserMinus } from "lucide-react";

const VideoDetails = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    
    const [video, setVideo] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);

    // --- FOLLOW/UNFOLLOW LOGIC ---
    const handleToggleSubscribe = async () => {
        // ID nikalne ke saare raaste check karo
        const channelId = video.ownerDetails?._id || video.owner?._id || video.owner;
        
        console.log("DEBUG: Attempting to follow channel:", channelId);

        if (!channelId) {
            alert("Error: Creator ID not found!");
            return;
        }

        try {
            // UI ko turant update karo (Optimistic)
            setIsSubscribed(!isSubscribed);

            const response = await api.post(`/follow/c/${channelId}`);
            console.log("DEBUG: Follow API Response:", response.data);

            // Backend se aane wala real status set karo
            if (response.data?.data) {
                setIsSubscribed(response.data.data.isFollowing);
            }
        } catch (err) {
            setIsSubscribed(!isSubscribed); // Error pe wapas purana state
            console.error("DEBUG: Follow Error Details:", err.response || err);
            
            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                navigate("/login");
            }
        }
    };

    // --- LIKE LOGIC ---
    const handleVideoLike = useCallback(async () => {
        try {
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
            await api.post(`/like/toggle/v/${videoId}`);
        } catch (err) {
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
            console.error("Like error:", err);
        }
    }, [videoId, isLiked]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [videoRes, listRes] = await Promise.all([
                    api.get(`/video/${videoId}`),
                    api.get("/video")
                ]);

                const videoData = videoRes.data.data;
                setVideo(videoData);
                setIsLiked(videoData.isLiked || false);
                setLikesCount(videoData.likesCount || 0);
                setIsSubscribed(videoData.isSubscribed || false);

                const allVideos = listRes.data?.data?.docs || listRes.data?.data || [];
                setSuggestions(allVideos.filter(v => v._id !== videoId));
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [videoId]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white font-black italic">LOADING VISION...</div>;
    if (!video) return <div className="p-10 text-center text-white">Video not found</div>;

    const owner = video.ownerDetails || video.owner || {};

    return (
        <div className="bg-black min-h-screen text-white p-4 lg:p-10">
            <div className="max-w-7xl mx-auto flex flex-col lg:row gap-10 lg:flex-row">
                
                {/* Video Player & Info */}
                <div className="flex-1">
                    <div className="aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/10">
                        <video src={video.videoFile} controls autoPlay className="w-full h-full" />
                    </div>

                    <div className="mt-6">
                        <h1 className="text-2xl font-black">{video.title}</h1>
                        
                        <div className="flex flex-wrap items-center justify-between mt-6 py-4 border-y border-white/5">
                            <div className="flex items-center gap-4">
                                <img src={owner.avatar} className="w-12 h-12 rounded-full object-cover border border-white/10" alt="avatar" />
                                <div>
                                    <p className="font-bold">@{owner.username}</p>
                                    <p className="text-[10px] text-zinc-500 font-black uppercase">Creator</p>
                                </div>
                                
                                {/* FOLLOW BUTTON */}
                                <button 
                                    onClick={handleToggleSubscribe}
                                    className={`ml-4 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                        isSubscribed ? "bg-zinc-800 text-zinc-400" : "bg-white text-black hover:scale-105"
                                    }`}
                                >
                                    {isSubscribed ? <span className="flex items-center gap-2"><UserMinus size={14}/> Unfollow</span> : <span className="flex items-center gap-2"><UserPlus size={14}/> Follow</span>}
                                </button>
                            </div>

                            <div className="flex items-center gap-4 bg-zinc-900 p-2 rounded-2xl">
                                <button onClick={handleVideoLike} className={`flex items-center gap-2 px-4 py-1 rounded-xl ${isLiked ? "text-blue-500" : ""}`}>
                                    <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} /> {likesCount}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-1"><Share2 size={20} /> Share</button>
                            </div>
                        </div>

                        <div className="mt-6 p-6 bg-zinc-900/50 rounded-2xl border border-white/5">
                            <p className="text-sm text-zinc-400">{video.description}</p>
                        </div>

                        <div className="mt-10">
                            <CommentSection videoId={videoId} />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:w-80 space-y-4">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Up Next</p>
                    {suggestions.map(v => (
                        <div key={v._id} onClick={() => navigate(`/v/${v._id}`)} className="flex gap-3 cursor-pointer group">
                            <div className="w-32 h-20 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                                <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition" alt="thumb" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold line-clamp-2">{v.title}</p>
                                <p className="text-[10px] text-zinc-500 mt-1">@{v.owner?.username || v.ownerDetails?.username}</p>
                            </div>
                        </div>
                    ))}
                </aside>
            </div>
        </div>
    );
};

export default VideoDetails;