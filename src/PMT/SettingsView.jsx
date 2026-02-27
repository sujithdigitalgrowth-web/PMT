import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SettingsView = ({ users = [], setUsers, currentUser }) => {
  const [settingsSearch, setSettingsSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const availableRoles = [
    { id: 'Super Admin', label: 'Super Admin' },
    { id: 'Director', label: 'Director' },
    { id: 'Business Head', label: 'Business Head' },
    { id: 'Snr Manager', label: 'Snr Manager' },
    { id: 'Project Manager', label: 'Project Manager' },
    { id: 'CSM', label: 'CSM' },
    { id: 'Manager', label: 'Manager' },
    { id: 'Snr Executive', label: 'Snr Executive' },
    { id: 'Executive', label: 'Executive' },
    { id: 'Intern', label: 'Intern' }
  ];

  const canEditRoles = currentUser?.role === 'Super Admin' || currentUser?.role === 'Director';

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(settingsSearch.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 font-sans text-left p-2">
      <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">User Status Control</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Logged in as: {currentUser?.name}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative w-56">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input 
              type="text" 
              placeholder="Filter members..." 
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg pl-12 pr-4 py-2 text-sm outline-none focus:border-green-500 font-medium" 
              value={settingsSearch} 
              onChange={(e) => setSettingsSearch(e.target.value)}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none min-w-[160px]"
          >
            <option value="All">All Designations</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
            <tr className="text-xs font-semibold text-slate-600">
              <th className="px-6 py-1">Agency Member</th>
              <th className="px-6 py-1 text-right">Assign Designation</th>
            </tr>
          </thead>
        </table>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-all bg-white">
                  <td className="px-6 py-1">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">{u.name}</span>
                      <span className="text-xs font-medium text-slate-500 mt-0.5">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-1 text-right">
                    <select
                      value={u.role}
                      disabled={!canEditRoles}
                      onChange={(e) => canEditRoles && setUsers(users.map(item => item.id === u.id ? { ...item, role: e.target.value } : item))}
                      className={`bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none min-w-[180px] ${!canEditRoles ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {availableRoles.map(role => (
                        <option key={role.id} value={role.id}>{role.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;