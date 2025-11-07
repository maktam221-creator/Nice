import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 border-b border-slate-200 md:hidden">
      <div className="flex justify-center items-center h-16 px-4 sm:px-8">
        <div className="text-2xl font-bold text-indigo-600">
          تطبيقنا
        </div>
      </div>
    </header>
  );
};

export default Header;