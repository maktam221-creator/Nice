import React, { useState, useEffect, useRef } from 'react';
import { Story, User } from '../types';
import { XIcon } from './Icons';

interface StoryViewerProps {
  user: User;
  stories: Story[];
  onClose: () => void;
  onNextUser: () => void;
  onPrevUser: () => void;
  onMarkAsViewed: (storyId: number) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ user, stories, onClose, onNextUser, onPrevUser, onMarkAsViewed }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onMarkAsViewed(stories[currentIndex].id);
  }, [currentIndex, stories, onMarkAsViewed]);

  const goToNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onNextUser();
    }
  };

  const goToPrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onPrevUser();
    }
  };

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!isPaused) {
      timerRef.current = window.setTimeout(() => {
        goToNextStory();
      }, 5000); // 5 seconds per story
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, isPaused, stories, onNextUser]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const tapPosition = (clientX - left) / width;

    if (tapPosition > 0.3) { // Tap on the right 70%
      goToNextStory();
    } else { // Tap on the left 30%
      goToPrevStory();
    }
  };

  const handleMouseDown = () => setIsPaused(true);
  const handleMouseUp = () => setIsPaused(false);
  const handleMouseLeave = () => setIsPaused(false);

  const currentStory = stories[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
      <div 
        className="relative w-full max-w-lg h-full max-h-[95vh] rounded-lg shadow-2xl overflow-hidden bg-slate-900"
        onClick={handleTap}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        {/* Progress Bars */}
        <div className="absolute top-2 left-0 right-0 px-2 flex space-x-1 rtl:space-x-reverse z-20">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              {index < currentIndex && <div className="h-full bg-white w-full"></div>}
              {index === currentIndex && (
                <div 
                    ref={progressRef}
                    className={`h-full bg-white ${!isPaused ? 'animate-progress-bar' : ''}`}
                    style={{ width: isPaused ? progressRef.current?.style.width : undefined }}
                    onAnimationEnd={e => {
                      // prevent bubbling up if animation is inside another animation
                      e.stopPropagation();
                      // only trigger next story if animation ends naturally (not paused)
                      if (!isPaused) {
                          goToNextStory();
                      }
                    }}
                ></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Header */}
        <div className="absolute top-5 left-0 right-0 px-4 flex justify-between items-center z-20">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full"/>
                <span className="text-white font-bold">{user.name}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75" aria-label="إغلاق">
                <XIcon className="w-6 h-6 text-white"/>
            </button>
        </div>

        {/* Story Content */}
        {currentStory.type === 'image' ? (
          <>
            <img src={currentStory.content} alt="Story content" className="w-full h-full object-contain" />
            {currentStory.caption && (
              <p className="absolute bottom-10 left-0 right-0 p-4 text-center text-white text-lg bg-black bg-opacity-50 mx-auto w-fit rounded-md max-w-[90%]">
                {currentStory.caption}
              </p>
            )}
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center p-8 ${currentStory.backgroundColor}`}>
            <p className="text-white text-3xl font-bold text-center">{currentStory.content}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
