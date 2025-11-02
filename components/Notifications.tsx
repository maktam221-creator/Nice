import React from 'react';
import { Notification, NotificationType } from '../types';
import { HeartIcon, CommentIcon, UserPlusIcon } from './Icons';

interface NotificationsProps {
  notifications: Notification[];
  onClose: () => void;
  onNavigate: (notification: Notification) => void;
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const baseClass = "w-5 h-5";
  switch (type) {
    case 'like':
      return <HeartIcon className={`${baseClass} text-red-500`} />;
    case 'comment':
      return <CommentIcon className={`${baseClass} text-sky-500`} />;
    case 'follow':
      return <UserPlusIcon className={`${baseClass} text-indigo-500`} />;
    default:
      return null;
  }
};

const getNotificationText = (notification: Notification): React.ReactNode => {
    switch (notification.type) {
        case 'like':
            return <><strong>{notification.actor.name}</strong> أعجب بمنشورك.</>;
        case 'comment':
            return <><strong>{notification.actor.name}</strong> علّق على منشورك.</>;
        case 'follow':
            return <><strong>{notification.actor.name}</strong> بدأ بمتابعتك.</>;
    }
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onClose, onNavigate }) => {
  return (
    <div className="absolute top-14 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-30">
        <div className="p-4 border-b">
            <h3 className="font-bold text-slate-800">الإشعارات</h3>
        </div>
        {notifications.length === 0 ? (
             <div className="p-6 text-center text-slate-500">
                <p>لا توجد إشعارات جديدة.</p>
            </div>
        ) : (
            <ul className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
                {notifications.map(notif => (
                <li key={notif.id}>
                    <button onClick={() => onNavigate(notif)} className={`w-full text-right p-4 flex items-start space-x-3 rtl:space-x-reverse transition-colors ${!notif.read ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <img src={notif.actor.avatarUrl} alt={notif.actor.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-700">{getNotificationText(notif)}</p>
                            <p className="text-xs text-slate-500 mt-1">{notif.timestamp}</p>
                        </div>
                    </button>
                </li>
                ))}
            </ul>
        )}
    </div>
  );
};

export default Notifications;
