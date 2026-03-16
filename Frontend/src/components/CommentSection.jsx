import { useState, useEffect } from "react";
import api from "../api/axios";
import { Send, Trash2, Heart, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CommentSection = ({ videoId }) => {
    const { user: currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/comment/v/${videoId}`);
            const commentData = res.data.data.docs || res.data.data || [];
            setComments(commentData);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        if (videoId) fetchComments();
    }, [videoId]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            await api.post(`/comment/v/${videoId}`, { content: newComment });
            setNewComment("");
            fetchComments(); 
        } catch (err) {
            console.error("Post error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostReply = async (parentId) => {
        if (!replyContent.trim()) return;
        setLoading(true);
        try {
            await api.post(`/comment/v/${videoId}`, { 
                content: replyContent,
                parentId: parentId 
            });
            setReplyContent("");
            setReplyingTo(null);
            fetchComments();
        } catch (err) {
            console.error("Reply error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLike = async (commentId) => {
        const previousComments = [...comments];
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                return {
                    ...c,
                    isLiked: !c.isLiked,
                    likesCount: c.isLiked ? (c.likesCount || 1) - 1 : (c.likesCount || 0) + 1
                };
            }
            return c;
        }));

        try {
            await api.post(`/like/toggle/c/${commentId}`);
        } catch (err) {
            console.error("Error toggling like:", err);
            setComments(previousComments);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await api.delete(`/comment/c/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // --- REUSEABLE COMMENT COMPONENT ---
    const CommentItem = ({ comment, isReply = false }) => {
        const [showReplies, setShowReplies] = useState(true);
        const owner = comment.ownerDetails?.[0] || (Array.isArray(comment.owner) ? comment.owner[0] : comment.owner);
        const isOwner = currentUser?._id === owner?._id;
        
        // Find if this comment has children
        const childReplies = comments.filter(reply => reply.parentId === comment._id);
        const hasReplies = childReplies.length > 0;

        return (
            <div className={`group/item ${isReply ? 'mt-6' : 'mt-10'}`}>
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <img 
                            src={owner?.avatar || "https://via.placeholder.com/150"} 
                            className={`${isReply ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} object-cover ring-1 ring-white/5`} 
                            alt="avatar" 
                        />
                        {/* Vertical line for threaded look if replies are visible */}
                        {hasReplies && showReplies && (
                            <div className="w-[1px] flex-1 bg-zinc-800 mt-2 mb-2" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className={`font-black text-white uppercase tracking-tight ${isReply ? 'text-[10px]' : 'text-xs'}`}>
                                    {owner?.fullname || "Visionary"}
                                </span>
                                <span className="text-[9px] text-indigo-500 font-bold uppercase opacity-60">
                                    @{owner?.username || "anonymous"}
                                </span>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-medium uppercase">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <p className={`text-zinc-400 leading-relaxed selection:bg-indigo-500/30 ${isReply ? 'text-xs' : 'text-sm'}`}>
                            {comment.content}
                        </p>
                        
                        <div className="flex items-center gap-6 mt-4">
                            <button 
                                onClick={() => handleToggleLike(comment._id)}
                                className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all active:scale-90 ${comment.isLiked ? 'text-rose-500' : 'text-zinc-600 hover:text-rose-400'}`}
                            >
                                <Heart size={14} fill={comment.isLiked ? "currentColor" : "none"} className={comment.isLiked ? "animate-pulse" : ""} /> 
                                {comment.likesCount || 0}
                            </button>

                            <button 
                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${replyingTo === comment._id ? 'text-indigo-400' : 'text-zinc-600 hover:text-indigo-400'}`}
                            >
                                <MessageSquare size={14} /> Reply
                            </button>

                            {hasReplies && (
                                <button 
                                    onClick={() => setShowReplies(!showReplies)}
                                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showReplies ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                    {showReplies ? "Hide" : `Show ${childReplies.length}`}
                                </button>
                            )}

                            {isOwner && (
                                <button 
                                    onClick={() => handleDelete(comment._id)} 
                                    className="opacity-0 group-hover/item:opacity-100 text-zinc-700 hover:text-rose-500 transition-all ml-auto"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>

                        {/* Reply Input Box */}
                        {replyingTo === comment._id && (
                            <div className="mt-6 pl-4 border-l-2 border-indigo-500/20 animate-in slide-in-from-left-2 duration-300">
                                <div className="bg-zinc-900/40 p-3 rounded-2xl border border-white/5">
                                    <input 
                                        autoFocus
                                        className="w-full bg-transparent border-none outline-none text-xs text-zinc-300 placeholder:text-zinc-700 pb-3"
                                        placeholder={`Transmit reply to @${owner?.username}...`}
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePostReply(comment._id)}
                                    />
                                    <div className="flex justify-end gap-4 border-t border-white/5 pt-3">
                                        <button onClick={() => setReplyingTo(null)} className="text-[9px] font-black uppercase text-zinc-600 hover:text-white transition-colors">Cancel</button>
                                        <button 
                                            onClick={() => handlePostReply(comment._id)} 
                                            disabled={!replyContent.trim()}
                                            className="text-[9px] font-black uppercase text-indigo-500 hover:text-indigo-400 disabled:opacity-20"
                                        >
                                            Transmit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Render Nested Replies (Recursively) */}
                        {showReplies && (
                            <div className="ml-2">
                                {childReplies.map(reply => (
                                    <CommentItem key={reply._id} comment={reply} isReply={true} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mt-12 border-t border-zinc-900 pt-10 max-w-4xl mx-auto px-4 pb-20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-zinc-800"></span>
                {comments.length} Discussion Points
            </h3>
            
            <form onSubmit={handlePostComment} className="flex gap-4 mb-16 bg-zinc-900/20 p-4 rounded-3xl border border-white/5 focus-within:border-indigo-500/50 transition-colors">
                <img src={currentUser?.avatar} className="w-10 h-10 rounded-2xl object-cover ring-1 ring-white/10" alt="me" />
                <div className="flex-1 flex flex-col gap-3">
                    <textarea 
                        className="w-full bg-transparent border-none outline-none py-2 transition-all text-sm placeholder:text-zinc-600 resize-none"
                        placeholder="Add to the vision..."
                        rows="2"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end border-t border-white/5 pt-3">
                        <button 
                            disabled={loading || !newComment.trim()} 
                            className="bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-30 transition-all flex items-center gap-2"
                        >
                            {loading ? "Publishing..." : <>Publish <Send size={12}/></>}
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-4">
                {comments
                    .filter(c => !c.parentId)
                    .map((c) => (
                        <CommentItem key={c._id} comment={c} />
                    ))
                }
            </div>
        </div>
    );
};

export default CommentSection;