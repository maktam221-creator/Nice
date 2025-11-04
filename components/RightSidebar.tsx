import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Message } from '../types';
import { PaperAirplaneIcon, ChevronRightIcon } from './Icons';

interface RightSidebarProps {
  currentUser: User;
  allUsers: Record<string, User>;
  messages: Message[];
  onSendMessage: (recipient: User, text: string) => void;
  followingUsers: User[];
  onViewProfile: (user: User) => void;
  initialTargetUser: User | null;
  onClearTargetUser: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
    currentUser,
    allUsers,
    messages,
    onSendMessage,
    followingUsers, 
    onViewProfile,
    initialTargetUser,
    onClearTargetUser
}) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialTargetUser) {
          setSelectedUser(initialTargetUser);
          onClearTargetUser();
        }
    }, [initialTargetUser, onClearTargetUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedUser]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageText.trim() && selectedUser) {
          onSendMessage(selectedUser, messageText);
          setMessageText('');
        }
    };

    const conversation = useMemo(() => {
        if (!selectedUser || !currentUser) return [];
        return messages.filter(
          (msg) =>
            (msg.senderKey === currentUser.uid && msg.receiverKey === selectedUser.uid) ||
            (msg.senderKey === selectedUser.uid && msg.receiverKey === currentUser.uid)
        );
    }, [messages, selectedUser, currentUser]);

    if (selectedUser) {
        return (
            <div className="bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-140px)]">
                <div className="p-3 border-b flex items-center space-x-3 rtl:space-x-reverse shadow-sm">
                    <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ChevronRightIcon className="w-5 h-5 text-slate-500" />
                    </button>
                    <button onClick={() => onViewProfile(selectedUser)} className="flex items-center space-x-2 rtl:space-x-reverse group">
                        <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-9 h-9 rounded-full" />
                        <span className="font-bold text-slate-800 text-sm group-hover:underline">{selectedUser.name}</span>
                    </button>
                </div>
                <div className="flex-1 p-2 overflow-y-auto bg-slate-50 space-y-3">
                    {conversation.map((msg) => {
                        const isSentByCurrentUser = msg.senderKey === currentUser.uid;
                        return (
                            <div key={msg.id} className={`flex items-end gap-2 ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`w-fit max-w-[85%] p-2 rounded-xl ${isSentByCurrentUser ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-slate-200 text-slate-800 rounded-bl-md'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-2 bg-white border-t">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="اكتب رسالة..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                        />
                        <button type="submit" className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex-shrink-0" disabled={!messageText.trim()}>
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        )
    }

  return (
    <div className="space-y-6 sticky top-24">
      {/* Following List Card */}
      {followingUsers.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">الدردشات</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {followingUsers.map(user => (
              <div key={user.uid} className="flex items-center justify-between">
                <button onClick={() => setSelectedUser(user)} className="w-full flex items-center space-x-3 rtl:space-x-reverse group text-right p-2 rounded-md hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    {user.isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800 group-hover:underline">{user.name}</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Footer or ads */}
       <div className="text-xs text-slate-400 space-x-2 rtl:space-x-reverse text-center">
            <a href="#" className="hover:underline">حول</a>
            <span>&middot;</span>
            <a href="#" className="hover:underline">مساعدة</a>
            <span>&middot;</span>
            <a href="#" className="hover:underline">خصوصية</a>
            <span>&middot;</span>
            <a href="#" className="hover:underline">شروط</a>
       </div>
    </div>
  );
};

export default RightSidebar;