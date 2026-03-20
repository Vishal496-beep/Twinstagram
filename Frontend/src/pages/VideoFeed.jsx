import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const VideoFeed = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await api.get("/"); 
                // Handling aggregatePaginate structure safely
                const fetchedVideos = res.data?.data?.docs || res.data?.data || [];
                setVideos(fetchedVideos); 
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    // --- SKELETON GRID ---
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3 animate-pulse">
                        <div className="aspect-video w-full bg-zinc-900 rounded-xl" />
                        <div className="flex gap-3 px-1">
                            <div className="w-9 h-9 rounded-full bg-zinc-900 shrink-0" />
                            <div className="flex flex-col gap-2 w-full">
                                <div className="h-4 bg-zinc-900 w-full rounded" />
                                <div className="h-3 bg-zinc-800 w-1/2 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.length > 0 ? (
                videos.map((video) => {
                    const owner = video.ownerDetails || video.owner;
                    return (
                        <div 
                            key={video._id} 
                            className="cursor-pointer group flex flex-col gap-3"
                            onClick={() => navigate(`/v/${video._id}`)}
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 shadow-lg border border-white/5">
                                <img 
                                    src={video.thumbnail} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                    alt={video.title} 
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/640x360?text=Vision"; }}
                                />
                                {video.duration && (
                                    <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-[10px] font-black px-1.5 py-0.5 rounded text-white">
                                        {Math.floor(video.duration / 60)}:{Math.floor(video.duration % 60).toString().padStart(2, '0')}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex gap-3 px-1">
                                <img 
                                    src={owner?.avatar || `https://ui-avatars.com/api/?name=${owner?.username}`} 
                                    className="w-9 h-9 rounded-full object-cover border border-zinc-800 shadow-md shrink-0" 
                                    alt="avatar" 
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                                />
                                <div className="flex flex-col overflow-hidden">
                                    <h3 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors duration-300">
                                        {video.title}
                                    </h3>
                                    <p className="text-zinc-500 text-[11px] font-bold mt-1">
                                        {owner?.fullName || owner?.username || "Vision Creator"}
                                    </p>
                                    <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-tighter">
                                        {video.views?.toLocaleString() || 0} views • {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : "Just now"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="col-span-full text-center py-20 text-zinc-600 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                    <p className="font-bold text-sm tracking-widest uppercase">No visions found</p>
                    <p className="text-xs mt-1">Be the first to upload to the Vision network!</p>
                </div>
            )}
        </div>
    );
};

export default VideoFeed;