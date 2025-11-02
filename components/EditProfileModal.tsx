import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { XIcon } from './Icons';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [gender, setGender] = useState(user.gender || '');
  const [country, setCountry] = useState(user.country || '');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setGender(user.gender || '');
      setCountry(user.country || '');
    }
  }, [user]);

  if (!isOpen) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name,
      bio,
      gender,
      country,
    });
    onClose();
  };
  
  const countries = ["السعودية", "مصر", "الإمارات", "الكويت", "قطر", "البحرين", "عمان", "الأردن", "لبنان", "المغرب", "تونس", "الجزائر"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 p-6 relative animate-fade-in-up">
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h2 className="text-xl font-bold text-slate-800">تعديل الملف الشخصي</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="إغلاق">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
                <option value="">اختر النوع</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
                <option value="أفضل عدم القول">أفضل عدم القول</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">الدولة</label>
              <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
                 <option value="">اختر الدولة</option>
                 {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end items-center border-t pt-4 space-x-2 rtl:space-x-reverse">
             <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors">
              إلغاء
            </button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;