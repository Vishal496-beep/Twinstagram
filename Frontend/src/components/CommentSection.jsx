import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { Send, Trash2, Heart, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CommentSection = ({ id, type = "video" }) => { // 'id' common rakha hai (videoId ya tweetId)
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [loading, setLoading] = useState(false);

    // Dynamic prefix logic (v for video, t for tweet)
    const prefix = type === "video" ? "v" : "t";

    const fetchComments = useCallback(async () => {
        if (!id) return;
        try {
            const res = await api.get(`/comment/${prefix}/${id}`);
            // Backend agar aggregatePaginate use kar raha hai toh .docs check karo
            const commentData = res.data.data.docs || res.data.data || [];
            setComments(commentData);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }, [id, prefix]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!currentUser) return navigate("/login");

        setLoading(true);
        try {
            await api.post(`/comment/${prefix}/${id}`, { content: newComment });
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
            // Replying logic: parentId body mein jayega
            await api.post(`/comment/${prefix}/${id}`, { 
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
        if (!currentUser) return navigate("/login");

        // Optimistic Update: Pehle UI badlo, phir API call
        const previousComments = [...comments];
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                const isNowLiked = !c.isLiked;
                return {
                    ...c,
                    isLiked: isNowLiked,
                    likesCount: isNowLiked ? (c.likesCount || 0) + 1 : (c.likesCount || 1) - 1
                };
            }
            return c;
        }));

        try {
            await api.post(`/like/toggle/c/${commentId}`);
        } catch (err) {
            setComments(previousComments); // Error pe wapas purana state
            console.error("Like toggle error:", err);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await api.delete(`/comment/c/${commentId}`);
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // --- RECURSIVE COMMENT ITEM ---
    const CommentItem = ({ comment, isReply = false }) => {
        const [showReplies, setShowReplies] = useState(true);
        const owner = comment.ownerDetails?.[0] || comment.owner;
        const isOwner = currentUser?._id === owner?._id;
        
        const childReplies = comments.filter(reply => reply.parentId === comment._id);
        const hasReplies = childReplies.length > 0;

        return (
            <div className={`group/item ${isReply ? 'mt-4 ml-6 border-l border-zinc-800 pl-4' : 'mt-8'}`}>
                <div className="flex gap-3">
                    <img 
                        src={owner?.avatar || `https://ui-avatars.com/api/?name=${owner?.username}`} 
                        className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} rounded-full object-cover`} 
                        alt="avatar" 
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold text-white">@{owner?.username || "user"}</span>
                            <span className="text-[9px] text-zinc-600">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-snug">{comment.content}</p>
                        
                        <div className="flex items-center gap-4 mt-3">
                            <button 
                                onClick={() => handleToggleLike(comment._id)}
                                className={`flex items-center gap-1 text-[10px] font-bold ${comment.isLiked ? 'text-rose-500' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <Heart size={14} fill={comment.isLiked ? "currentColor" : "none"} /> 
                                {comment.likesCount || 0}
                            </button>

                            <button 
                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                className="text-[10px] font-bold text-zinc-500 hover:text-indigo-400 flex items-center gap-1"
                            >
                                <MessageSquare size={14} /> Reply
                            </button>

                            {isOwner && (
                                <button onClick={() => handleDelete(comment._id)} className="text-zinc-700 hover:text-rose-500 transition-colors">
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </div>

                        {/* Reply Input */}
                        {replyingTo === comment._id && (
                            <div className="mt-3 flex gap-2">
                                <input 
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                                    placeholder="Write a reply..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    autoFocus
                                />
                                <button 
                                    onClick={() => handlePostReply(comment._id)}
                                    className="text-[10px] font-black uppercase text-indigo-500 px-2"
                                >
                                    Send
                                </button>
                            </div>
                        )}

                        {/* Nested Replies Rendering */}
                        {hasReplies && (
                            <div className="mt-2">
                                <button 
                                    onClick={() => setShowReplies(!showReplies)}
                                    className="text-[10px] text-zinc-600 font-bold hover:text-zinc-400 mb-2"
                                >
                                    {showReplies ? "Hide Replies" : `Show ${childReplies.length} Replies`}
                                </button>
                                {showReplies && childReplies.map(reply => (
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
        <div className="mt-10 max-w-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">
                {comments.length} Comments
            </h3>
            
            <form onSubmit={handlePostComment} className="flex gap-3 mb-10">
                <img src={currentUser?.avatar || "https://via.placeholder.com/40"} className="w-9 h-9 rounded-full" alt="me" />
                <div className="flex-1 flex flex-col gap-2">
                    <textarea 
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500/50 resize-none"
                        placeholder="Add a comment..."
                        rows="2"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button 
                            disabled={loading || !newComment.trim()} 
                            className="bg-indigo-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-30"
                        >
                            {loading ? "..." : "Post"}
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-2">
                {comments.filter(c => !c.parentId).map((c) => (
                    <CommentItem key={c._id} comment={c} />
                ))}
            </div>
        </div>
    );
};

export default CommentSection;