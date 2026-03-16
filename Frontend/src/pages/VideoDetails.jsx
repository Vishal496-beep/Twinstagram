import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import CommentSection from "../components/CommentSection.jsx";
import { ThumbsUp, Share2 } from "lucide-react";

const VideoDetails = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    
    const [video, setVideo] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    // Like handler logic
    const handleVideoLike = useCallback(async () => {
        if (!videoId) return;
        try {
            await api.post(`/like/toggle/v/${videoId}`);
            setIsLiked(prev => !prev);
            setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
        } catch (err) {
            console.error("Like error:", err);
        }
    }, [videoId, isLiked]);

    // Data Fetching logic (Single, clean useEffect)
    useEffect(() => {
        let isMounted = true;
        
        const fetchAllData = async () => {
            try {
                setLoading(true);
                // Important: Reset video to null so the key triggers a fresh render
                setVideo(null); 

                const [videoRes, listRes] = await Promise.all([
                    api.get(`/video/${videoId}`),
                    api.get("/video")
                ]);

                if (isMounted) {
                    const videoData = videoRes.data.data;
                    setVideo(videoData);
                    setIsLiked(videoData.isLiked || false);
                    setLikesCount(videoData.likesCount || 0);

                    const allVideos = listRes.data.data.docs || [];
                    setSuggestions(allVideos.filter(v => v._id !== videoId));
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAllData();

        return () => {
            isMounted = false;
        };
    }, [videoId]); 

    if (loading) return <div className="p-20 text-center animate-pulse text-zinc-500 font-black">LOADING VISION...</div>;
    if (!video) return <div className="p-10 text-white text-center">Vision not found.</div>;

    // Safety check for owner details
    const owner = video.ownerDetails || video.owner || {};

    return (
        <div key={videoId} className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto p-4 lg:p-8">
            <div className="flex-1 min-w-0">
                <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                    <video 
                        key={videoId} // Use videoId as key to force reset on navigation
                        src={video?.videoFile} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain" 
                    />
                </div>

                <div className="mt-6">
                    <h1 className="text-2xl font-black text-white leading-tight">{video?.title}</h1>
                    
                    <div className="flex flex-wrap items-center justify-between mt-6 pb-6 border-b border-zinc-800 gap-6">
                        <div className="flex items-center gap-4">
                            <img 
                                src={owner?.avatar || `https://ui-avatars.com/api/?name=${owner?.username || 'U'}`} 
                                className="w-12 h-12 rounded-full border border-zinc-700 object-cover" 
                                alt="owner"
                            />
                            <div>
                                <h3 className="font-bold text-white">@{owner?.username || 'unknown'}</h3>
                                <p className="text-[10px] text-zinc-500 uppercase font-black">Vision Creator</p>
                            </div>
                            <button className="ml-4 bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-transform active:scale-95">
                                Subscribe
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-2xl border border-white/5">
                            <button 
                                onClick={handleVideoLike}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-xs font-bold ${
                                    isLiked ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
                                {likesCount.toLocaleString()}
                            </button>
                            <div className="w-px h-5 bg-zinc-800" />
                            <button className="flex items-center gap-2 px-5 py-2.5 text-zinc-400 hover:text-white text-xs font-bold">
                                <Share2 size={18} /> Share
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 bg-zinc-900/40 p-6 rounded-3xl border border-white/5">
                        <div className="flex gap-3 font-black text-[11px] mb-3 text-zinc-500 uppercase tracking-tighter">
                            <span>{video?.views?.toLocaleString()} views</span>
                            <span>•</span>
                            <span>{video?.createdAt ? new Date(video.createdAt).toDateString() : ''}</span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{video?.description}</p>
                    </div>

                    <div className="mt-10">
                        <CommentSection videoId={videoId} />
                    </div>
                </div>
            </div>

            <aside className="w-full lg:w-96 space-y-5">
                <h2 className="font-black uppercase text-[10px] tracking-widest text-zinc-500 mb-2">Up Next</h2>
                {suggestions.map((item) => {
                    const sOwner = item.ownerDetails || item.owner;
                    return (
                        <div 
                            key={item._id} 
                            onClick={() => navigate(`/v/${item._id}`)} 
                            className="flex gap-3 cursor-pointer group"
                        >
                            <div className="w-40 aspect-video rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-white/5">
                                <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            </div>
                            <div className="py-1 min-w-0">
                                <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                                <p className="text-[10px] text-zinc-500 font-bold mt-1 truncate">@{sOwner?.username || 'Creator'}</p>
                            </div>
                        </div>
                    );
                })}
            </aside>
        </div>
    );
};

export default VideoDetails;