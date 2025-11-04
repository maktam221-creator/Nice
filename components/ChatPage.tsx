import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Message } from '../types';
import { PaperAirplaneIcon, LockClosedIcon, LockOpenIcon, XIcon } from './Icons';

interface ChatPageProps {
  currentUser: User;
  allUsers: Record<string, User>;
  messages: Message[];
  onSendMessage: (recipient: User, text: string) => void;
  followingUsers: User[];
  initialTargetUser: User | null;
  onClearTargetUser: () => void;
  onViewProfile: (user: User) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({
  currentUser,
  allUsers,
  messages,
  onSendMessage,
  followingUsers,
  initialTargetUser,
  onClearTargetUser,
  onViewProfile
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(initialTargetUser);
  const [messageText, setMessageText] = useState('');
  const [lockedChats, setLockedChats] = useState<string[]>([]); // Add state for locked chats
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

  const handleToggleLock = (user: User) => {
    const userUid = user.uid;
    if (!userUid) return;

    setLockedChats(prev => 
      prev.includes(userUid) 
        ? prev.filter(key => key !== userUid) 
        : [...prev, userUid]
    );
  };

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
  
  const isSelectedChatLocked = selectedUser ? lockedChats.includes(selectedUser.uid) : false;

  return (
    <div className="bg-white rounded-lg shadow-md h-[calc(100vh-160px)] flex flex-col md:flex-row overflow-hidden">
      {/* Conversation List */}
      <div className={`w-full md:w-1/3 border-l rtl:border-l-0 rtl:border-r border-slate-200 flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">الدردشات</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {followingUsers.length > 0 ? (
            followingUsers.map((user) => {
              const isLocked = lockedChats.includes(user.uid);
              return (
                <button
                  key={user.uid}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-right p-4 flex items-center justify-between space-x-4 rtl:space-x-reverse transition-colors ${
                    selectedUser?.uid === user.uid ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="relative">
                        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                        {user.isOnline && (
                           <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                        )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{user.name}</p>
                    </div>
                  </div>
                  {isLocked && <LockClosedIcon className="w-5 h-5 text-slate-400 shrink-0" />}
                </button>
              );
            })
          ) : (
             <div className="p-6 text-center text-slate-500">
                <p>تابع المستخدمين لبدء الدردشة.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex-col ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center justify-between shadow-sm">
              <button onClick={() => onViewProfile(selectedUser)} className="flex items-center space-x-3 rtl:space-x-reverse group">
                  <div className="relative">
                      <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-10 h-10 rounded-full" />
                      {selectedUser.isOnline && (
                         <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
                      )}
                  </div>
                  <span className="font-bold text-slate-800 group-hover:underline">{selectedUser.name}</span>
              </button>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <button 
                  onClick={() => handleToggleLock(selectedUser)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  aria-label={isSelectedChatLocked ? 'فتح قفل الدردشة' : 'قفل الدردشة'}
                >
                  {isSelectedChatLocked 
                      ? <LockClosedIcon className="w-6 h-6 text-slate-500" /> 
                      : <LockOpenIcon className="w-6 h-6 text-slate-500" />
                  }
                </button>
                <button 
                    onClick={() => setSelectedUser(null)} 
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors md:hidden"
                    aria-label="إغلاق المحادثة"
                >
                    <XIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>
            </div>
            {isSelectedChatLocked ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-50 p-4">
                    <LockClosedIcon className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold">الدردشة مقفلة</h3>
                    <p className="mb-4">هذه المحادثة مقفلة للحفاظ على خصوصيتك.</p>
                    <button 
                        onClick={() => handleToggleLock(selectedUser)}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        فتح القفل
                    </button>
                </div>
            ) : (
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                  {conversation.map((msg) => {
                     const isSentByCurrentUser = msg.senderKey === currentUser.uid;
                     const sender = allUsers[msg.senderKey];
                     return (
                        <div key={msg.id} className={`flex items-end gap-3 ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
                           {!isSentByCurrentUser && sender && <img src={sender.avatarUrl} alt={sender.name} className="w-8 h-8 rounded-full"/>}
                           <div>
                             <div className={`w-fit max-w-xs lg:max-w-md p-3 rounded-2xl ${isSentByCurrentUser ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-slate-200 text-slate-800 rounded-bl-lg'}`}>
                               <p className="text-sm">{msg.text}</p>
                             </div>
                             <p className={`text-xs text-slate-400 mt-1 px-1 ${isSentByCurrentUser ? 'text-left' : 'text-right'}`}>{msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                        </div>
                     );
                  })}
                  <div ref={messagesEndRef} />
                </div>
            )}
            <div className="p-4 bg-white border-t">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={isSelectedChatLocked ? 'الدردشة مقفلة' : 'اكتب رسالتك...'}
                  className="w-full p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  disabled={isSelectedChatLocked}
                />
                <button
                  type="submit"
                  className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex-shrink-0"
                  disabled={!messageText.trim() || isSelectedChatLocked}
                  aria-label="إرسال"
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 md:flex items-center justify-center text-center text-slate-500 bg-slate-50 hidden">
            <div>
              <h3 className="text-xl font-semibold">اختر محادثة</h3>
              <p>ابدأ الدردشة مع متابعيك.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;