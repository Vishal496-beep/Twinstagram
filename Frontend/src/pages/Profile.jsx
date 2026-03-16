import { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Film, Settings, PlusSquare, Image, Twitter, Trash2, Edit3, Share2, UserPlus, UserCheck } from "lucide-react";
import api from "../api/axios.js";

// Component Imports
import EditProfileModal from "../components/EditProfileModal.jsx";
import UserListModal from "../components/UserListModal.jsx";
import EditContentModal from "../components/EditContentModal.jsx";

const Profile = () => {
    const { user: currentUser } = useAuth(); 
    const { darkMode } = useOutletContext();
    const { username: urlUsername } = useParams(); // For viewing other profiles
    
    // Determine whose profile to fetch
    const targetUsername = urlUsername || currentUser?.username;

    // UI & Content State
    const [activeTab, setActiveTab] = useState("videos"); 
    const [content, setContent] = useState([]); 
    const [profileStats, setProfileStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    
    // Modal States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [listModal, setListModal] = useState({ isOpen: false, type: 'followers' });
    const [editContent, setEditContent] = useState({ isOpen: false, item: null });

    // Check if the profile belongs to the logged-in user
    const isOwnProfile = currentUser?.username === targetUsername;

    // --- Content Actions ---
    const handleFollowToggle = async () => {
        if (isOwnProfile) return;
        try {
            // Using your route: /api/v1/follow/c/:profileId
            const res = await api.post(`/follow/c/${profileStats?._id}`);
            if (res.data.success) {
                const following = res.data.data.isFollowing;
                setIsSubscribed(following);
                // Optimistic UI update for counts
                setProfileStats(prev => ({
                    ...prev,
                    followersCount: following ? prev.followersCount + 1 : prev.followersCount - 1
                }));
            }
        } catch (err) {
            console.error("Follow toggle failed:", err);
        }
    };

    const handleShareProfile = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert("Profile link copied to clipboard!");
    };

    const handleDeleteContent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            let endpoint = "";
            if (activeTab === "videos") endpoint = `/video/${id}`;
            else if (activeTab === "photos") endpoint = `/photo/${id}`;
            else if (activeTab === "tweets") endpoint = `/tweet/${id}`;

            const res = await api.delete(endpoint);
            if (res.data.success) {
                setContent(prev => prev.filter(item => item._id !== id));
                setProfileStats(prev => ({
                    ...prev,
                    totalContentCount: Math.max(0, (prev.totalContentCount || 0) - 1)
                }));
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleEditSuccess = (updatedItem) => {
        setContent(prev => prev.map(item => item._id === updatedItem._id ? updatedItem : item));
        setEditContent({ isOpen: false, item: null });
    };

    const handleUpdateSuccess = (updatedData) => {
        setProfileStats(prev => ({
            ...prev,
            fullname: updatedData.fullname || prev?.fullname,
            bio: updatedData.bio || prev?.bio,
            avatar: updatedData.avatar || prev?.avatar 
        }));
        setIsEditOpen(false); 
    };

    // --- Data Fetching ---
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!targetUsername) return;
            try {
                const res = await api.get(`/users/c/${targetUsername}`);
                if (res.data.success) {
                    setProfileStats(res.data.data);
                    setIsSubscribed(res.data.data.isSubscribed);
                }
            } catch (err) {
                console.error("Error fetching profile stats:", err);
            }
        };
        fetchProfileData();
    }, [targetUsername]);

    useEffect(() => {
        const fetchTabContent = async () => {
            if (!profileStats?._id) return;
            setLoading(true);
            try {
                let endpoint = "";
                if (activeTab === "videos") endpoint = `/video?userId=${profileStats._id}`;
                else if (activeTab === "photos") endpoint = `/photo/user/${profileStats._id}`;
                else if (activeTab === "tweets") endpoint = `/tweet/user/${profileStats._id}`;

                const res = await api.get(endpoint);
                const fetchedData = res.data.data?.docs || res.data.data || [];
                setContent(fetchedData);
            } catch (err) {
                console.error(`Error fetching ${activeTab}:`, err);
                setContent([]); 
            } finally {
                setLoading(false);
            }
        };
        fetchTabContent();
    }, [activeTab, profileStats?._id]);

    if (!profileStats && loading) return <LoadingSpinner darkMode={darkMode} />;

    return (
        <div className="max-w-4xl mx-auto pt-4 pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-12 px-4">
                <div className="relative shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-xl shadow-indigo-500/20">
                        <img 
                            src={profileStats?.avatar} 
                            alt="avatar" 
                            className={`w-full h-full rounded-full object-cover border-4 ${darkMode ? 'border-zinc-950' : 'border-white'}`}
                        />
                    </div>
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                        <h2 className="text-2xl font-light tracking-tight">@{profileStats?.username}</h2>
                        <div className="flex gap-2 justify-center">
                            {isOwnProfile ? (
                                <button 
                                    onClick={() => setIsEditOpen(true)}
                                    className={`px-6 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                                        darkMode ? 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800' : 'bg-white border-zinc-200 hover:bg-zinc-50'
                                    }`}
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <button 
                                    onClick={handleFollowToggle}
                                    className={`px-8 py-1.5 rounded-lg text-sm font-black uppercase tracking-widest transition-all active:scale-95 ${
                                        isSubscribed 
                                        ? (darkMode ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-zinc-100 text-zinc-500 border border-zinc-200')
                                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500'
                                    }`}
                                >
                                    {isSubscribed ? <span className="flex items-center gap-2"><UserCheck size={14}/> Following</span> : <span className="flex items-center gap-2"><UserPlus size={14}/> Follow</span>}
                                </button>
                            )}
                            <button onClick={handleShareProfile} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>
                                <Share2 size={20} />
                            </button>
                            <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>
                                <Settings size={22} className="hover:rotate-90 transition-transform duration-500" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center md:justify-start gap-8 text-sm">
                        <span><b className="text-lg">{profileStats?.totalContentCount || 0}</b> content</span>
                        <button onClick={() => setListModal({ isOpen: true, type: 'followers' })} className="hover:opacity-60 transition-opacity">
                            <b className="text-lg">{profileStats?.followersCount || 0}</b> followers
                        </button>
                        <button onClick={() => setListModal({ isOpen: true, type: 'following' })} className="hover:opacity-60 transition-opacity">
                            <b className="text-lg">{profileStats?.followingCount || 0}</b> following
                        </button>
                    </div>

                    <div>
                        <p className={`font-black text-sm uppercase tracking-widest ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                            {profileStats?.fullname}
                        </p>
                        <p className={`text-sm mt-2 leading-relaxed max-w-md ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {profileStats?.bio || "No bio added yet."}
                        </p>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className={`flex justify-center border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
                <div className="flex gap-12">
                    {[
                        { id: 'videos', icon: <Film size={16} />, label: 'Videos' },
                        { id: 'photos', icon: <Image size={16} />, label: 'Photos' },
                        { id: 'tweets', icon: <Twitter size={16} />, label: 'Tweets' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 text-xs font-black uppercase tracking-[0.2em] border-t-2 transition-all ${
                                activeTab === tab.id 
                                ? (darkMode ? 'border-white text-white' : 'border-zinc-900 text-zinc-900') 
                                : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Display */}
            <div className="mt-8 px-4">
                {loading ? (
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`aspect-square animate-pulse rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                        ))}
                    </div>
                ) : content.length > 0 ? (
                    activeTab === 'tweets' ? (
                        <div className="max-w-xl mx-auto flex flex-col gap-4">
                            {content.map(tweet => (
                                <div key={tweet._id} className={`relative p-6 rounded-3xl border transition-colors group ${darkMode ? 'bg-zinc-900/40 border-white/5 hover:border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
                                    {isOwnProfile && (
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditContent({ isOpen: true, item: tweet })} className="text-zinc-500 hover:text-indigo-500 transition-colors"><Edit3 size={16}/></button>
                                            <button onClick={() => handleDeleteContent(tweet._id)} className="text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed mb-4">{tweet.content}</p>
                                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{new Date(tweet.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            {content.map((item) => (
                                <div key={item._id} className="relative aspect-square group overflow-hidden bg-zinc-900 rounded-xl cursor-pointer shadow-lg">
                                    <img 
                                        src={item.thumbnail || item.imageUrl || item.url} 
                                        alt="content" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
                                    />
                                    {isOwnProfile && (
                                        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                            <button onClick={(e) => { e.stopPropagation(); setEditContent({ isOpen: true, item: item }); }} className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 text-white"><Edit3 size={20} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteContent(item._id); }} className="p-2 bg-red-500/20 backdrop-blur-md rounded-full hover:bg-red-500/40 text-red-500"><Trash2 size={20} /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <EmptyState activeTab={activeTab} darkMode={darkMode} />
                )}
            </div>

            {/* Modals */}
            <EditProfileModal 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
                user={{ ...currentUser, ...profileStats }} 
                onUpdateSuccess={handleUpdateSuccess} 
            />
            <UserListModal 
                isOpen={listModal.isOpen} 
                type={listModal.type} 
                profileId={profileStats?._id} 
                darkMode={darkMode} 
                onClose={() => setListModal({ ...listModal, isOpen: false })} 
            />
            <EditContentModal 
                isOpen={editContent.isOpen} 
                onClose={() => setEditContent({ isOpen: false, item: null })} 
                item={editContent.item} 
                type={activeTab} 
                darkMode={darkMode} 
                onUpdateSuccess={handleEditSuccess} 
            />
        </div>
    );
};

const LoadingSpinner = ({ darkMode }) => (
    <div className={`min-h-[80vh] flex items-center justify-center ${darkMode ? 'bg-[#09090b]' : 'bg-white'}`}>
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="animate-pulse text-zinc-500 font-bold tracking-widest uppercase text-[10px]">Loading Profile...</p>
        </div>
    </div>
);

const EmptyState = ({ activeTab, darkMode }) => (
    <div className="py-24 text-center">
        <div className={`inline-flex p-6 rounded-full mb-4 ${darkMode ? 'bg-zinc-900 text-zinc-700' : 'bg-zinc-100 text-zinc-300'}`}>
            <PlusSquare size={40} strokeWidth={1} />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">No {activeTab} captured yet.</p>
    </div>
);

export default Profile;