import React from 'react';
import { Home, Briefcase, Users, Settings, Network } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, setSelectedClient, isMinimized }) => {
  // Corrected array syntax and updated icons for better visual distinction
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={18}/> },
    { id: 'clients', label: 'Clients', icon: <Briefcase size={18}/> },
    { id: 'employees', label: 'Employee View', icon: <Network size={18} /> }, // Changed to Network icon for flowchart feel
    { id: 'users', label: 'User Management', icon: <Users size={18}/> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18}/> }
  ];

  return (
    <aside className={`${isMinimized ? 'w-20' : 'w-64'} bg-white border-r border-slate-100 flex flex-col transition-all duration-300 z-30`}>
      {/* XP Logo Section - Maintained professional black/white style */}
      <div className="p-8 flex justify-start pl-8">
        <div className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center font-black text-black tracking-tighter shadow-sm">
          XP
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-3">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button 
              key={item.id} 
              onClick={() => { 
                setActiveTab(item.id); 
                if(setSelectedClient) setSelectedClient(null); // Safety check
              }} 
              className={`w-full flex items-center ${isMinimized ? 'justify-center' : 'gap-4'} py-3.5 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-200 ${
                isActive 
                  ? 'border-2 border-black text-black bg-white shadow-md translate-x-1' 
                  : 'text-slate-400 border-2 border-transparent hover:text-black hover:bg-slate-50 bg-white'
              }`}
            >
              <div className={`${isActive ? 'text-black' : 'text-slate-400'}`}>
                {item.icon}
              </div>
              
              {!isMinimized && (
                <span className="whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Optional: Sidebar Footer */}
      {!isMinimized && (
        <div className="p-8">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Agency Tool</p>
            <p className="text-[10px] font-bold text-black uppercase tracking-tight">v2.0.26 Stable</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;