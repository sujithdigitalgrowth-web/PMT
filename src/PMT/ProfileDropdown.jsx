import React from 'react';
import { LogOut } from 'lucide-react';

const ProfileDropdown = ({ isProfileOpen, setIsProfileOpen, setIsNotifOpen, currentUser }) => {
  return (
    <div className="relative">
      <button 
        onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }} 
        className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-slate-100 bg-slate-50 hover:border-black transition-all"
      >
        <span className="text-[10px] lowercase italic font-bold text-slate-600">{currentUser.name}</span>
      </button>

      {isProfileOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-slate-50 border border-slate-200 rounded-2xl shadow-xl z-[300] overflow-hidden text-left font-sans uppercase">
          <div className="p-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold hover:bg-red-50 text-red-600 rounded-xl transition-all">
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;