import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Reel, User } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, MusicNoteIcon, CameraIcon, XIcon } from './Icons';
import CommentSection from './CommentSection';

interface ReelCardProps {
  reel: Reel;
  currentUser: User;
  onLike: (reelId: number) => void;
  onAddComment: (reelId: number, text: string) => void;
  onShare: (reelId: number) => void;
  onViewProfile: (user: User) => void;
  isActive: boolean;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel, currentUser, onLike, onAddComment, onShare, onViewProfile, isActive }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current?.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };
    
    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/#reel/${reel.id}`;
        if (navigator.share) {
            try {
            await navigator.share({
                title: `فيديو من ${reel.author.name}`,
                text: reel.caption,
                url: shareUrl,
            });
            onShare(reel.id);
            } catch (error) {
            console.error('خطأ في المشاركة:', error);
            }
        } else {
            alert('المشاركة غير مدعومة على هذا المتصفح.');
        }
    };

    return (
        <div className="h-full w-full relative snap-start flex items-center justify-center bg-black">
            <video
                ref={videoRef}
                src={reel.videoUrl}
                loop
                playsInline
                className="w-full h-full object-contain"
                onClick={togglePlay}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/60 to-transparent">
                <button onClick={() => onViewProfile(reel.author)} className="flex items-center space-x-3 rtl:space-x-reverse mb-2 group">
                    <img src={reel.author.avatarUrl} alt={reel.author.name} className="w-10 h-10 rounded-full border-2 border-white" />
                    <p className="font-bold group-hover:underline">{reel.author.name}</p>
                </button>
                <p className="text-sm">{reel.caption}</p>
                {reel.music && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm mt-2">
                        <MusicNoteIcon className="w-4 h-4" />
                        <p>{reel.music}</p>
                    </div>
                )}
            </div>
            <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-4 text-white">
                <button onClick={() => onLike(reel.id)} className="flex flex-col items-center">
                    <HeartIcon className={`w-8 h-8 ${reel.isLiked ? 'text-red-500 fill-current' : ''}`} />
                    <span className="text-sm font-semibold">{reel.likes}</span>
                </button>
                <button onClick={() => setShowComments(true)} className="flex flex-col items-center">
                    <CommentIcon className="w-8 h-8" />
                    <span className="text-sm font-semibold">{reel.comments.length}</span>
                </button>
                <button onClick={handleShare} className="flex flex-col items-center">
                    <ShareIcon className="w-8 h-8" />
                    <span className="text-sm font-semibold">{reel.shares}</span>
                </button>
            </div>
            {showComments && (
                <div className="absolute inset-0 bg-black bg-opacity-50 z-20 flex flex-col justify-end" onClick={() => setShowComments(false)}>
                    <div className="bg-white h-2/3 rounded-t-2xl p-4 text-slate-800 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                       <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-center flex-1">{reel.comments.length} تعليقات</h3>
                            <button onClick={() => setShowComments(false)}><XIcon className="w-6 h-6 text-slate-500"/></button>
                       </div>
                       <div className="h-[calc(100%-6rem)] overflow-y-auto">
                        <CommentSection comments={reel.comments} onAddComment={(text) => onAddComment(reel.id, text)} currentUser={currentUser} />
                       </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface ShortsPageProps {
  reels: Reel[];
  currentUser: User;
  onLike: (reelId: number) => void;
  onAddComment: (reelId: number, text: string) => void;
  onShare: (reelId: number) => void;
  onAddReel: () => void;
  onViewProfile: (user: User) => void;
}

const ShortsPage: React.FC<ShortsPageProps> = ({ reels, currentUser, onLike, onAddComment, onShare, onAddReel, onViewProfile }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        const { scrollTop, clientHeight } = container;
        const newIndex = Math.round(scrollTop / clientHeight);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
    }, [activeIndex]);

    return (
        <div className="relative h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] rounded-lg overflow-hidden bg-black">
            <div ref={containerRef} onScroll={handleScroll} className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
                {reels.map((reel, index) => (
                    <ReelCard 
                        key={reel.id} 
                        reel={reel} 
                        currentUser={currentUser} 
                        onLike={onLike}
                        onAddComment={onAddComment}
                        onShare={onShare}
                        onViewProfile={onViewProfile}
                        isActive={index === activeIndex}
                    />
                ))}
            </div>
            <button
                onClick={onAddReel}
                className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-colors"
                aria-label="إنشاء فيديو جديد"
            >
                <CameraIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

export default ShortsPage;
