import React from 'react';
import { Bell } from 'lucide-react';

const Notifications = ({ isNotifOpen, setIsNotifOpen, setIsProfileOpen, notifications }) => {
  return (
    <div className="relative">
      <button 
        onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }} 
        className="p-2 rounded-full border border-slate-100 bg-white relative transition-all hover:border-black"
      >
        <Bell size={18} className="text-black" />
        {notifications.some(n => !n.read) && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
        )}
      </button>

      {isNotifOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-[300] overflow-hidden text-left">
          <div className="p-4 border-b border-slate-50 bg-slate-50 font-bold text-[10px] uppercase tracking-wider text-slate-400">
            Notifications
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-all bg-white">
                <p className="text-[11px] font-bold lowercase leading-tight mb-1 text-black">{n.text}</p>
                <span className="text-[9px] font-black text-slate-300 uppercase">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;