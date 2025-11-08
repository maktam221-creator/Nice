import React from 'react';

const FeedPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">آخر المشاركات</h2>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 text-center text-gray-400 border border-gray-700">
        <p>لا توجد مشاركات لعرضها حالياً.</p>
        <p className="text-sm mt-2">هنا ستظهر المشاركات من أصدقائك والمجتمعات التي تتابعها.</p>
      </div>
    </div>
  );
};

export default FeedPage;
