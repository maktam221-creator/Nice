import React from 'react';
import Header from './Header';
import FeedPage from './FeedPage';

const App: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Header />
      <main className="container mx-auto p-4">
        <FeedPage />
      </main>
    </div>
  );
};

export default App;
