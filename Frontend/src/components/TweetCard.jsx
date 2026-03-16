import { Heart, MessageCircle, Share2, Edit3, Trash2, Send, UserPlus, UserCheck, MoreHorizontal } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../api/axios";

// Helper Component for Comment Likes
const CommentLikeButton = ({ comment }) => {
    const [liked, setLiked] = useState(comment.isLiked);
    const [count, setCount] = useState(comment.likesCount || 0);

    const toggleCommentLike = async (e) => {
        e.stopPropagation();
        try {
            const newState = !liked;
            setLiked(newState);
            setCount(prev => newState ? prev + 1 : prev - 1);
            await api.post(`/like/toggle/c/${comment._id}`);
        } catch (err) {
            setLiked(comment.isLiked);
            setCount(comment.likesCount || 0);
            console.error("Comment like failed", err);
        }
    };

    return (
        <button 
            onClick={toggleCommentLike}
            className={`flex items-center gap-1.5 transition-all active:scale-90 ${liked ? 'text-rose-500' : 'text-zinc-500 hover:text-rose-400'}`}
        >
            <Heart size={12} fill={liked ? "currentColor" : "none"} className={liked ? "animate-pulse" : ""} />
            <span className="text-[10px] font-black">{count > 0 ? count : ""}</span>
        </button>
    );
};

const TweetCard = ({ tweet, onDelete, onEdit, darkMode }) => {
    const { user } = useAuth();
    
    // State Management
    const [isLiked, setIsLiked] = useState(tweet.isLiked);
    const [likesCount, setLikesCount] = useState(tweet.likesCount || 0);
    const [isFollowing, setIsFollowing] = useState(tweet.ownerDetails?.isSubscribed);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [comments, setComments] = useState([]);
    const [isHovered, setIsHovered] = useState(false);

    // Sync state with props when the tweet object changes (important for tab switching)
    useEffect(() => {
        setIsLiked(tweet.isLiked);
        setLikesCount(tweet.likesCount || 0);
        setIsFollowing(tweet.ownerDetails?.isSubscribed);
    }, [tweet]);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/comment/t/${tweet._id}`);
            setComments(res.data.data || []);
        } catch (err) {
            console.error("Error fetching comments", err);
        }
    };

    useEffect(() => {
        if (showReplyInput) fetchComments();
    }, [showReplyInput]);

    const handleLike = async () => {
        const prevState = isLiked;
        const prevCount = likesCount;
        try {
            // Optimistic Update
            const newLikedState = !isLiked;
            setIsLiked(newLikedState);
            setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
            
            await api.post(`/like/toggle/t/${tweet._id}`); 
        } catch (err) {
            // Rollback on error
            setIsLiked(prevState);
            setLikesCount(prevCount);
        }
    };

    const handleFollowToggle = async (e) => {
        e.stopPropagation();
        const prevState = isFollowing;
        try {
            // Optimistic Update: Change UI immediately
            setIsFollowing(!prevState);
            
            const response = await api.post(`/follow/c/${tweet.owner}`);
            
            // If backend returns the actual state, sync it
            if (response.data?.data && typeof response.data.data.isSubscribed !== 'undefined') {
                setIsFollowing(response.data.data.isSubscribed);
            }
        } catch (err) {
            // Rollback UI on error
            console.error("Follow error:", err);
            setIsFollowing(prevState);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        setIsSubmittingReply(true);
        try {
            await api.post(`/comment/t/${tweet._id}`, { content: replyText });
            setReplyText("");
            fetchComments(); 
        } catch (err) {
            console.error("Reply failed", err);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const formatContent = (text) => {
        if (!text) return "";
        return text.split(/(\s+)/).map((word, i) => {
            if (word.startsWith("#")) return <span key={i} className="text-indigo-400 font-bold">{word}</span>;
            if (word.startsWith("@")) return <span key={i} className="text-purple-400 font-bold">{word}</span>;
            return word;
        });
    };

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative p-6 rounded-[2.5rem] border transition-all duration-500 group mb-6 ${
                darkMode 
                ? 'bg-zinc-900/40 border-white/5 hover:border-indigo-500/30 hover:bg-zinc-900/60 shadow-2xl' 
                : 'bg-white border-zinc-100 shadow-sm hover:shadow-xl'
            } ${isHovered ? 'scale-[1.01]' : 'scale-100'}`}
        >
            {/* Background Glow */}
            <div className={`absolute -z-10 inset-0 blur-3xl transition-opacity duration-700 ${isHovered ? 'opacity-15' : 'opacity-0'} bg-gradient-to-br from-indigo-600 via-transparent to-purple-600`} />

            <div className="flex gap-5">
                {/* Avatar with Status */}
                <div className="relative shrink-0">
                    <img 
                        src={tweet.ownerDetails?.avatar} 
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-offset-2 ring-offset-zinc-950 ring-indigo-500/30 shadow-2xl" 
                        alt="avatar" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-zinc-900 rounded-full" />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-[15px] tracking-tight text-white group-hover:text-indigo-400 transition-colors uppercase">
                                    {tweet.ownerDetails?.fullname}
                                </h4>
                                
                                {user?._id !== tweet.owner && (
                                    <button 
                                        onClick={handleFollowToggle}
                                        className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter transition-all duration-300 ${
                                            isFollowing 
                                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                                            : 'bg-white text-black hover:scale-110 active:scale-95'
                                        }`}
                                    >
                                        {isFollowing ? 'Following' : '+ Follow'}
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest opacity-60">
                                @{tweet.ownerDetails?.username} • {new Date(tweet.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Owner Actions */}
                        <div className="flex items-center gap-1">
                            {user?._id === tweet.owner && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <button onClick={() => onEdit(tweet)} className="p-2 hover:bg-indigo-500/20 rounded-xl text-zinc-400 hover:text-indigo-400 transition-colors">
                                        <Edit3 size={15} />
                                    </button>
                                    <button onClick={() => onDelete(tweet._id)} className="p-2 hover:bg-rose-500/20 rounded-xl text-zinc-400 hover:text-rose-500 transition-colors">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            )}
                            <button className="p-2 text-zinc-600 hover:text-zinc-400"><MoreHorizontal size={18} /></button>
                        </div>
                    </div>

                    <p className="mt-4 text-[15px] leading-relaxed text-zinc-300 selection:bg-indigo-500/30 whitespace-pre-wrap">
                        {formatContent(tweet.content)}
                    </p>

                    {/* Media Enclosure */}
                    {(tweet.image || tweet.video) && (
                        <div className="mt-5 overflow-hidden rounded-4xl border border-white/5 shadow-inner bg-black/20">
                            {tweet.image && (
                                <img src={tweet.image} alt="tweet-media" className="w-full object-cover max-h-96 hover:scale-105 transition-transform duration-1000" />
                            )}
                            {tweet.video && (
                                <video src={tweet.video} className="w-full max-h-96" controls />
                            )}
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center gap-8 mt-6 pt-4 border-t border-white/5">
                        <button 
                            onClick={handleLike} 
                            className={`group/btn flex items-center gap-2 text-[10px] font-black transition-all ${isLiked ? 'text-rose-500' : 'text-zinc-500 hover:text-rose-400'}`}
                        >
                            <div className={`p-2.5 rounded-2xl transition-all ${isLiked ? 'bg-rose-500/10' : 'group-hover/btn:bg-rose-500/10'}`}>
                                <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={isLiked ? 'animate-bounce' : ''} />
                            </div>
                            <span className="tracking-widest">{likesCount}</span>
                        </button>

                        <button 
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className={`group/btn flex items-center gap-2 text-[10px] font-black transition-all ${showReplyInput ? 'text-indigo-400' : 'text-zinc-500 hover:text-indigo-400'}`}
                        >
                            <div className={`p-2.5 rounded-2xl transition-all ${showReplyInput ? 'bg-indigo-500/10' : 'group-hover/btn:bg-indigo-500/10'}`}>
                                <MessageCircle size={18} />
                            </div>
                            <span className="tracking-widest uppercase">Discuss</span>
                        </button>

                        <button className="group/btn p-2.5 rounded-2xl text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 ml-auto transition-all">
                            <Share2 size={18} />
                        </button>
                    </div>

                    {/* Comments Drawer */}
                    {showReplyInput && (
                        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment._id} className="flex gap-4 items-start bg-white/5 p-4 rounded-3xl border border-white/5 group/comment">
                                            <img src={comment.ownerDetails?.avatar} className="w-8 h-8 rounded-xl border border-white/10 object-cover" alt="avatar" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">@{comment.ownerDetails?.username}</p>
                                                    <CommentLikeButton comment={comment} />
                                                </div>
                                                <p className="text-xs text-zinc-300 leading-relaxed">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 opacity-40">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No signals detected yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Reply Input Box */}
                            <div className="flex gap-3 bg-zinc-800/30 p-2 rounded-full border border-white/5 focus-within:border-indigo-500/50 transition-all">
                                <input 
                                    autoFocus
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Transmit your thoughts..."
                                    className="flex-1 bg-transparent px-4 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                />
                                <button 
                                    onClick={handleSendReply}
                                    disabled={isSubmittingReply || !replyText.trim()}
                                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full disabled:opacity-30 transition-all active:scale-90"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TweetCard;