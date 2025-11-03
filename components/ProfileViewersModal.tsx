
import React from 'react';
import { User } from '../types';
import { XIcon, EyeIcon } from './Icons';

interface ProfileViewersModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewers: { viewer: User; timestamp: string }[];
  onViewProfile: (user: User) => void;
}

const ProfileViewersModal: React.FC<ProfileViewersModalProps> = ({ isOpen, onClose, viewers, onViewProfile }) => {
  if (!isOpen) {
    return null;
  }

  const handleViewProfileClick = (user: User) => {
    onViewProfile(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm m-4 p-6 relative animate-fade-in-up">
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h2 className="flex items-center space-x-2 rtl:space-x-reverse text-xl font-bold text-slate-800">
            <EyeIcon className="w-6 h-6 text-slate-500" />
            <span>من شاهد ملفك الشخصي</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="إغلاق">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        {viewers && viewers.length > 0 ? (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {viewers.map(({ viewer, timestamp }, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <button onClick={() => handleViewProfileClick(viewer)} className="flex items-center space-x-3 rtl:space-x-reverse group text-right w-full p-2 rounded-md hover:bg-slate-50 transition-colors">
                            <img src={viewer.avatarUrl} alt={viewer.name} className="w-12 h-12 rounded-full" />
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 group-hover:underline">{viewer.name}</p>
                                <p className="text-sm text-slate-500">{timestamp}</p>
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center text-slate-500 py-8">
                <p>لم يشاهد أحد ملفك الشخصي بعد.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default ProfileViewersModal;
