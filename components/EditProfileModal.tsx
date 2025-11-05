import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { XIcon } from './Icons';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: User) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [gender, setGender] = useState(user.gender?.value || '');
  const [isGenderPublic, setIsGenderPublic] = useState(user.gender?.isPublic ?? true);
  const [country, setCountry] = useState(user.country?.value || '');
  const [isCountryPublic, setIsCountryPublic] = useState(user.country?.isPublic ?? true);
  const [saveError, setSaveError] = useState<string | null>(null);

  // This effect populates the form when the modal is opened or the user prop changes.
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name);
      setBio(user.bio || '');
      setGender(user.gender?.value || '');
      setIsGenderPublic(user.gender?.isPublic ?? true);
      setCountry(user.country?.value || '');
      setIsCountryPublic(user.country?.isPublic ?? true);
      setSaveError(null);
    }
  }, [user, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = async () => {
    setSaveError(null);
    const updatedUser: User = {
      ...user,
      name,
      bio,
      gender: { value: gender, isPublic: isGenderPublic },
      country: { value: country, isPublic: isCountryPublic },
    };
    try {
      await onSave(updatedUser);
      onClose();
    } catch (error: any) {
      setSaveError(error.message || 'فشل حفظ التغييرات. قد تكون هناك مشكلة في الاتصال أو الصلاحيات.');
    }
  };
  
  const countries = ["السعودية", "مصر", "الإمارات", "الكويت", "قطر", "البحرين", "عمان", "الأردن", "لبنان", "المغرب", "تونس", "الجزائر"];

  const VisibilityToggle: React.FC<{ isPublic: boolean; setVisibility: (isPublic: boolean) => void; }> = ({ isPublic, setVisibility }) => (
    <div className="flex rounded-md shadow-sm shrink-0 mr-2 rtl:mr-0 rtl:ml-2" role="group">
      <button
        type="button"
        onClick={() => setVisibility(true)}
        className={`px-3 py-2 text-sm font-medium border transition-colors ${
          isPublic
            ? 'bg-indigo-600 text-white border-indigo-600 z-10'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
        } rounded-r-md rtl:rounded-r-none rtl:rounded-l-md`}
      >
        عام
      </button>
      <button
        type="button"
        onClick={() => setVisibility(false)}
        className={`px-3 py-2 text-sm font-medium border border-r-0 rtl:border-r rtl:border-l-0 transition-colors ${
          !isPublic
            ? 'bg-indigo-600 text-white border-indigo-600 z-10'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
        } rounded-l-md rtl:rounded-l-none rtl:rounded-r-md`}
      >
        خاص
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 p-6 relative animate-fade-in-up">
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h2 className="text-xl font-bold text-slate-800">تعديل الملف الشخصي</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="إغلاق">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">المؤهل / نبذة تعريفية</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none" placeholder="اكتب نبذة قصيرة عنك..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">النوع</label>
              <div className="flex items-center">
                <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
                  <option value="">اختر النوع</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                  <option value="أفضل عدم القول">أفضل عدم القول</option>
                </select>
                <VisibilityToggle isPublic={isGenderPublic} setVisibility={setIsGenderPublic} />
              </div>
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">الدولة</label>
              <div className="flex items-center">
                <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
                   <option value="">اختر الدولة</option>
                   {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <VisibilityToggle isPublic={isCountryPublic} setVisibility={setIsCountryPublic} />
              </div>
            </div>
          </div>
          
          {saveError && <p className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-md">{saveError}</p>}
          
          <div className="flex justify-end items-center border-t pt-4 space-x-2 rtl:space-x-reverse">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors">
              إلغاء
            </button>
            <button type="button" onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
