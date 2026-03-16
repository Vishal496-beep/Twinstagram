import { useEffect, useState } from "react";
import api from "../api/axios.js";
import VideoCard from "../components/VideoCard.jsx";

const VideoHome = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use an AbortController to prevent memory leaks/multiple hits
        const controller = new AbortController();

        const fetchVideos = async () => {
            try {
                const res = await api.get("/video", { signal: controller.signal });
                // Ensure we handle the aggregatePaginate 'docs' structure correctly
                const fetchedVideos = res.data?.data?.docs || res.data?.data || [];
                setVideos(fetchedVideos);
            } catch (err) {
                if (err.name !== 'CanceledError') {
                    console.error("Failed to fetch videos", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
        return () => controller.abort(); // Cleanup on unmount
    }, []); // Empty dependency array = only runs once

    return (
        <div className="min-h-screen bg-[#09090b] p-6 lg:p-10">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                    Discover <span className="text-indigo-500">Visions</span>
                </h1>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-video bg-zinc-900 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {videos.length > 0 ? (
                        videos.map(video => (
                            <VideoCard key={video._id} video={video} />
                        ))
                    ) : (
                        <div className="col-span-full text-zinc-500 text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
                            No visions found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoHome;