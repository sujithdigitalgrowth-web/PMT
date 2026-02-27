import React, { useState } from 'react';
import { Home, Briefcase, Users, Settings, Network, SlidersHorizontal, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, setSelectedClient, isMinimized, setIsMinimized, canSeeControlCenter = false, canSeeSettings = true, canSeeUserManagement = true, canSeeEmployeeView = true, canSeeMetrics = true }) => {
  const [logoError, setLogoError] = useState(false);

  // Corrected array syntax and updated icons for better visual distinction
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={18}/> },
    { id: 'clients', label: 'Clients', icon: <Briefcase size={18}/> },
    { id: 'users', label: 'User Management', icon: <Users size={18}/> },
    { id: 'metrics', label: 'Metrics', icon: <BarChart3 size={18}/> },
    { id: 'employees', label: 'Employee View', icon: <Network size={18} /> }, // Changed to Network icon for flowchart feel
    { id: 'settings', label: 'Settings', icon: <Settings size={18}/> },
    { id: 'master-data', label: 'Control Center', icon: <SlidersHorizontal size={18}/> }
  ].filter(item => {
    if (item.id === 'master-data') return canSeeControlCenter;
    if (item.id === 'settings') return canSeeSettings;
    if (item.id === 'users') return canSeeUserManagement;
    if (item.id === 'employees') return canSeeEmployeeView;
    if (item.id === 'metrics') return canSeeMetrics;
    return true;
  });

  return (
    <aside className={`${isMinimized ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-100 to-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 z-30`}>
      {/* XP Logo Section - Maintained professional black/white style */}
      <div className="p-7 flex justify-start pl-7">
        <div className="w-40 h-10 border-2 border-slate-800 bg-white rounded-xl flex items-center justify-center font-black text-slate-900 tracking-tighter shadow-sm">
          {!logoError ? (
            <img
              src="/company-logo.png"
              alt="Company Logo"
              className="h-7 w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span>Ethinos</span>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3.5 space-y-2.5">
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
                  ? 'border border-blue-200 text-slate-900 bg-white shadow-sm' 
                  : 'text-slate-600 border border-transparent hover:text-slate-900 hover:bg-white hover:border-slate-200 bg-transparent'
              }`}
            >
              <div className={`${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
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

      {/* Sidebar Footer */}
      <div className="p-4">
        {!isMinimized && (
          <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 mb-3 shadow-sm">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Powered by Ethinos</p>
          </div>
        )}
        <button
          onClick={() => setIsMinimized && setIsMinimized(!isMinimized)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest text-slate-600 border border-slate-200 hover:bg-white hover:border-blue-200 hover:text-slate-900 transition-all duration-200 bg-white/80 shadow-sm"
          title={isMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
        >
          {isMinimized ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;