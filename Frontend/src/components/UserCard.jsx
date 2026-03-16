import { useNavigate } from "react-router-dom";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

const UserCard = ({ userData, isFollowing, onToggleFollow, followLoading, isMe }) => {
    const navigate = useNavigate();

    return (
        <div className="group flex items-center justify-between p-5 bg-zinc-900/30 border border-white/5 rounded-[2rem] hover:bg-zinc-900/60 hover:border-indigo-500/20 transition-all duration-300">
            <div 
                className="flex items-center gap-4 cursor-pointer"
                /* FIXED: Navigates to username to match UserProfile params */
                onClick={() => navigate(`/profile/${userData.username}`)}
            >
                <div className="relative">
                    <img 
                        src={userData.avatar} 
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/10 group-hover:ring-indigo-500/40 transition-all"
                        alt={userData.username} 
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">
                        {userData.fullname}
                    </h3>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">
                        @{userData.username}
                    </p>
                </div>
            </div>

            {!isMe && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent navigating to profile when clicking follow
                        onToggleFollow();
                    }}
                    disabled={followLoading}
                    className={`p-3 rounded-xl transition-all active:scale-90 ${
                        isFollowing 
                        ? 'bg-zinc-800 text-zinc-400 border border-white/5 hover:text-rose-500' 
                        : 'bg-white text-black hover:bg-indigo-500 hover:text-white shadow-xl'
                    }`}
                >
                    {followLoading ? <Loader2 size={18} className="animate-spin" /> : 
                     isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                </button>
            )}
        </div>
    );
};

export default UserCard;