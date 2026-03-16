import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

const VideoCard = ({ video }) => {
    const navigate = useNavigate();

    // FIX: Standardize the owner object regardless of backend naming
    const owner = video.ownerDetails || video.owner;

    return (
        <div 
            onClick={() => {
                navigate(`/v/${video._id}`);
                if (window.location.pathname.startsWith('/v/')) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }}
            className="group cursor-pointer space-y-3"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/5">
                <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-indigo-600 p-3 rounded-full text-white shadow-xl shadow-indigo-600/50">
                        <Play fill="currentColor" size={20} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex gap-3 px-1">
                <img 
                    src={owner?.avatar || `https://ui-avatars.com/api/?name=${owner?.username || 'V'}`} 
                    className="w-9 h-9 rounded-full border border-white/10 object-cover shrink-0"
                    alt="avatar"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
                        {video.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-1 truncate">
                        @{owner?.username || 'Vision Creator'}
                    </p>
                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-0.5">
                        {video.views?.toLocaleString() || 0} views
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;