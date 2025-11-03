
import React, { useState, useEffect } from 'react';
import { XIcon, CogIcon, ShieldCheckIcon, KeyIcon, UserCircleIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

type SettingsView = 'main' | 'privacy' | 'password' | 'account';

// A simple toggle switch component
const ToggleSwitch: React.FC<{ label: string }> = ({ label }) => {
    const [isOn, setIsOn] = useState(false);
    return (
        <label htmlFor={label} className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-700">{label}</span>
            <div className="relative">
                <input id={label} type="checkbox" className="sr-only" checked={isOn} onChange={() => setIsOn(!isOn)} />
                <div className={`block w-14 h-8 rounded-full transition ${isOn ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isOn ? 'translate-x-6' : ''}`}></div>
            </div>
        </label>
    );
};


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onLogout }) => {
  const [activeView, setActiveView] = useState<SettingsView>('main');

  // Reset view when modal is closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setActiveView('main');
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const settingsOptions = [
    { name: 'الخصوصية والأمان', icon: ShieldCheckIcon, view: 'privacy' as SettingsView },
    { name: 'كلمة المرور', icon: KeyIcon, view: 'password' as SettingsView },
    { name: 'الحساب', icon: UserCircleIcon, view: 'account' as SettingsView },
  ];
  
  const titles: Record<SettingsView, string> = {
    main: 'الإعدادات',
    privacy: 'الخصوصية والأمان',
    password: 'كلمة المرور',
    account: 'الحساب',
  };

  const renderMainView = () => (
    <div className="space-y-2">
        {settingsOptions.map((option) => (
            <button 
                key={option.name} 
                onClick={() => setActiveView(option.view)}
                className="w-full text-right p-3 flex items-center justify-between space-x-4 rtl:space-x-reverse rounded-lg hover:bg-slate-100 transition-colors"
                aria-label={option.name}
            >
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <option.icon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-800">{option.name}</p>
                    </div>
                </div>
                <ChevronLeftIcon className="w-5 h-5 text-slate-400" />
            </button>
        ))}
    </div>
  );
  
  const renderPrivacyView = () => (
    <div className="space-y-6">
        <div>
            <h3 className="font-semibold text-slate-800 mb-2">من يمكنه رؤية ملفك الشخصي؟</h3>
            <div className="space-y-2">
                <label className="flex items-center space-x-3 rtl:space-x-reverse">
                    <input type="radio" name="privacy" value="public" className="text-indigo-600 focus:ring-indigo-500" defaultChecked />
                    <span className="text-slate-700">الجميع</span>
                </label>
                <label className="flex items-center space-x-3 rtl:space-x-reverse">
                    <input type="radio" name="privacy" value="followers" className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-slate-700">المتابعون فقط</span>
                </label>
            </div>
        </div>
        <div className="border-t pt-4">
             <ToggleSwitch label="المصادقة الثنائية" />
        </div>
    </div>
  );
  
  const renderPasswordView = () => (
      <form className="space-y-4">
          <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور الحالية</label>
              <input type="password" id="current-password" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>
          <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور الجديدة</label>
              <input type="password" id="new-password" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>
          <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">تأكيد كلمة المرور الجديدة</label>
              <input type="password" id="confirm-password" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>
          <div className="flex justify-end pt-2">
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
                  تغيير كلمة المرور
              </button>
          </div>
      </form>
  );

  const renderAccountView = () => (
    <div className="space-y-4">
        <div>
            <h3 className="text-sm font-medium text-slate-500">البريد الإلكتروني</h3>
            <p className="text-slate-800">example@email.com</p>
        </div>
        <div className="border-t pt-4 space-y-2">
             <button className="w-full text-right text-yellow-600 font-semibold p-2 rounded-md hover:bg-yellow-50 transition-colors">
                تعطيل الحساب مؤقتاً
            </button>
            <button className="w-full text-right text-red-600 font-semibold p-2 rounded-md hover:bg-red-50 transition-colors">
                حذف الحساب نهائياً
            </button>
        </div>
    </div>
  );

  const renderContent = () => {
    switch(activeView) {
      case 'privacy': return renderPrivacyView();
      case 'password': return renderPasswordView();
      case 'account': return renderAccountView();
      case 'main':
      default:
        return renderMainView();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 flex flex-col" style={{minHeight: '400px'}}>
        <div className="p-6 relative animate-fade-in-up flex-grow flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {activeView === 'main' ? (
                    <CogIcon className="w-6 h-6 text-slate-500" />
                ) : (
                    <button onClick={() => setActiveView('main')} className="p-2 -mr-2 rtl:-mr-0 rtl:-ml-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="رجوع">
                        <ChevronRightIcon className="w-6 h-6 text-slate-500" />
                    </button>
                )}
                <h2 className="text-xl font-bold text-slate-800">{titles[activeView]}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="إغلاق">
                <XIcon className="w-6 h-6 text-slate-500" />
            </button>
            </div>
            
            <div className="flex-grow">
                {renderContent()}
            </div>
        </div>
         <div className="bg-slate-50 p-4 border-t rounded-b-lg">
              <button 
                  onClick={onLogout} 
                  className="w-full text-center text-slate-600 font-semibold p-2 rounded-md hover:bg-slate-200 transition-colors"
              >
                تسجيل الخروج
              </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
