import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { View } from '../types';
import Sidebar from './Sidebar';
import BottomNavBar from './BottomNavBar';
import FeedPage from './FeedPage';
import ProfilePage from './ProfilePage';
import Header from './Header';
import RightSidebar from './RightSidebar';

const MainLayout: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [view, setView] = useState<View>({ page: 'feed' });

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        جاري تحميل الملف الشخصي...
      </div>
    );
  }
  
  const renderContent = () => {
    switch (view.page) {
      case 'profile':
        return <ProfilePage userId={view.userId!} setView={setView} />;
      case 'feed':
      default:
        return <FeedPage setView={setView} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
        <Sidebar setView={setView} currentView={view} signOut={signOut} currentUserId={profile.id} />
        <RightSidebar setView={setView} />
        
        {/* Main Content Area */}
        <div className="md:mr-64 xl:ml-80 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 w-full max-w-2xl mx-auto pt-8 md:pt-12 px-4 pb-24 md:pb-8">
                 {renderContent()}
            </main>
        </div>

        <BottomNavBar setView={setView} currentView={view} signOut={signOut} currentUserId={profile.id} />
    </div>
  );
};

export default MainLayout;