import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-purple-400">ميدان</h1>
            <p className="text-sm text-gray-400">مساحتك للتعبير والمشاركة</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
