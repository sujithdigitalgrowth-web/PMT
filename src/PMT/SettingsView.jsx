import React, { useState } from 'react';
import { Search, User, Filter, Award, Star, UserCheck, Shield, Briefcase } from 'lucide-react';

const SettingsView = ({ users = [], setUsers, currentUser }) => {
  const [settingsSearch, setSettingsSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const availableRoles = [
    { id: 'Super Admin', label: 'Super Admin', icon: <Award size={12}/> },
    { id: 'Director', label: 'Director', icon: <Star size={12}/> },
    { id: 'Project Manager', label: 'Project Manager', icon: <UserCheck size={12}/> },
    { id: 'Snr Executive', label: 'Snr Executive', icon: <Shield size={12}/> },
    { id: 'Executive', label: 'Executive', icon: <Briefcase size={12}/> },
    { id: 'Intern', label: 'Intern', icon: <User size={12}/> }
  ];

  const canEditRoles = currentUser?.role === 'Super Admin' || currentUser?.role === 'Director';

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(settingsSearch.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="w-full h-full flex flex-col bg-white font-sans text-left p-2">
      <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-8">
        <div>
          <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900">User Status Control</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in as: {currentUser?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input 
              type="text" 
              placeholder="Filter members..." 
              className="w-full border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-green-500 font-bold" 
              value={settingsSearch} 
              onChange={(e) => setSettingsSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 border border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
              <th className="px-10 py-5">Agency Member</th>
              <th className="px-10 py-5 text-right">Assign Designation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/30 transition-all bg-white">
                <td className="px-10 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-black uppercase">{u.name}</span>
                    <span className="text-[11px] text-slate-400 font-bold lowercase">{u.email}</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className={`inline-flex border-2 border-slate-50 rounded-2xl overflow-hidden bg-white ${!canEditRoles ? 'opacity-30 cursor-not-allowed' : ''}`}>
                    {availableRoles.map(role => (
                      <button
                        key={role.id}
                        onClick={() => canEditRoles && setUsers(users.map(item => item.id === u.id ? {...item, role: role.id} : item))}
                        className={`px-4 py-3.5 text-[9px] font-black uppercase flex items-center gap-2 transition-all border-r border-slate-50 last:border-r-0 ${
                          u.role === role.id ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-black hover:bg-slate-50 bg-white'
                        }`}
                      >
                        {role.icon} {role.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SettingsView;