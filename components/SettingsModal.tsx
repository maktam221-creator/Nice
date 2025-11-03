import React from 'react';
import { XIcon, CogIcon, ShieldCheckIcon, KeyIcon, UserCircleIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const settingsOptions = [
    { name: 'الخصوصية والأمان', icon: ShieldCheckIcon },
    { name: 'كلمة المرور', icon: KeyIcon },
    { name: 'الحساب', icon: UserCircleIcon },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative animate-fade-in-up">
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h2 className="flex items-center space-x-2 rtl:space-x-reverse text-xl font-bold text-slate-800">
            <CogIcon className="w-6 h-6 text-slate-500" />
            <span>الإعدادات</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="إغلاق">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <div className="space-y-2">
            {settingsOptions.map((option) => (
                <button 
                    key={option.name} 
                    className="w-full text-right p-3 flex items-center space-x-4 rtl:space-x-reverse rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label={option.name}
                >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <option.icon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-800">{option.name}</p>
                    </div>
                </button>
            ))}
        </div>
        
      </div>
    </div>
  );
};

export default SettingsModal;
