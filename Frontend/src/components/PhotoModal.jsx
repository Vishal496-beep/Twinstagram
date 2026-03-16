import React, { useEffect } from 'react';
import { X, Heart, Download, Check, Link2 } from 'lucide-react';

const PhotoModal = ({ photo, onClose, onLike, isCopied, onCopy }) => {
    
    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!photo) return null;

    // Use the same flexible image source logic as PhotoFeed
    const imageSrc = photo.photoFile || photo.imageUrl || photo.url;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-10">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity" 
                onClick={onClose} 
            />

            {/* Modal Container */}
            <div className="relative bg-[#09090b] w-full max-w-6xl h-full max-h-[85vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10">
                
                {/* Close Button (Mobile Floating) */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 z-110 p-2 bg-black/50 hover:bg-white/10 text-white rounded-full transition-all"
                >
                    <X size={24} />
                </button>

                {/* LEFT: Image Section */}
                <div className="flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden border-r border-white/5">
                    <img 
                        src={imageSrc} 
                        alt={photo.caption}
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* RIGHT: Interaction Sidebar */}
                <div className="w-full md:w-96 flex flex-col bg-zinc-900/50">
                    
                    {/* Header: User Info */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 p-0.5">
                                <img 
                                    src={photo.owner?.avatar || `https://ui-avatars.com/api/?name=${photo.owner?.username || 'V'}`} 
                                    className="w-full h-full rounded-full object-cover border-2 border-zinc-900"
                                    alt="avatar"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">@{photo.owner?.username || "creator"}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Creator</p>
                            </div>
                        </div>
                    </div>

                    {/* Content: Caption & Stats */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2 leading-tight italic tracking-tighter">
                                {photo.caption || "Untitled Vision"}
                            </h2>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                {photo.createdAt 
                                    ? `This piece was captured on ${new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
                                    : "A unique moment captured in the Vision universe."
                                }
                            </p>
                        </div>

                        {/* STATS ROW */}
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center shadow-inner">
                            <p className="text-[10px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Total Appreciations</p>
                            <p className="text-3xl font-black text-white">{photo.likesCount || 0}</p>
                        </div>
                    </div>

                    {/* Footer: Action Buttons */}
                    <div className="p-6 bg-zinc-950/50 space-y-3">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onLike(photo._id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
                                    photo.isLiked 
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 scale-[1.02]' 
                                    : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                            >
                                <Heart size={20} fill={photo.isLiked ? "currentColor" : "none"} />
                                {photo.isLiked ? 'Liked' : 'Appreciate'}
                            </button>
                            
                            <button 
                                onClick={onCopy}
                                className={`w-16 flex items-center justify-center rounded-2xl border transition-all ${
                                    isCopied ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-white/10 text-white hover:bg-white/5'
                                }`}
                            >
                                {isCopied ? <Check size={20} /> : <Link2 size={20} />}
                            </button>
                        </div>
                        
                        {/* Download Logic - uses the image URL directly */}
                        <a 
                            href={imageSrc}
                            download={`vision-${photo._id}.jpg`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 rounded-2xl border border-white/10 text-zinc-400 font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                            Download Original
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoModal;