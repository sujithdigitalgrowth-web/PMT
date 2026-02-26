import React, { useState } from 'react';
import { Search, Plus, X, Star, Shield, Trash2, Check, ChevronDown } from 'lucide-react';

const UserView = ({ users = [], setUsers, clients = [], settingsSearch = "", setSettingsSearch }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Executive", assignedProjects: [] });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setShowAddModal(false);
    setNewUser({ name: "", email: "", role: "Executive", assignedProjects: [] });
    setProjectSearch("");
  };

  const toggleProject = (projectName) => {
    const updated = newUser.assignedProjects.includes(projectName)
      ? newUser.assignedProjects.filter(p => p !== projectName)
      : [...newUser.assignedProjects, projectName];
    setNewUser({ ...newUser, assignedProjects: updated });
  };

  const filteredUsers = (users || []).filter(u => 
    u.name.toLowerCase().includes(settingsSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(settingsSearch.toLowerCase())
  );

  const filteredProjects = (clients || []).filter(c => 
    c.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-white min-h-full font-sans text-left p-2">
      {/* 1. TOP HEADER & MAIN SEARCH */}
      <div className="flex justify-between items-center mb-10 bg-white">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">User Management</h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Agency Access & Permissions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input 
              type="text" 
              placeholder="Filter users..." 
              className="w-full border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm bg-white outline-none focus:border-black transition-all shadow-sm" 
              value={settingsSearch} 
              onChange={(e) => setSettingsSearch(e.target.value)} 
            />
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-black text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-[0.15em] hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg">
            <Plus size={18}/> Add User
          </button>
        </div>
      </div>

      {/* 2. USER DIRECTORY TABLE */}
      <div className="border border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-8 py-5 text-left">Identify</th>
              <th className="px-8 py-5 text-left">Access Level</th>
              <th className="px-8 py-5 text-left">Active Projects</th>
              <th className="px-8 py-5 text-right">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/30 transition-colors bg-white">
                <td className="px-8 py-6 text-left">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-black uppercase tracking-tight">{user.name}</span>
                    <span className="text-[11px] text-slate-400 font-bold lowercase">{user.email}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-left">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${['Director', 'Snr Manager', 'Manager'].includes(user.role) ? 'bg-white border-orange-200 text-orange-600' : 'bg-white border-slate-100 text-slate-500'}`}>
                    {['Director', 'Snr Manager', 'Manager'].includes(user.role) && <Star size={12} className="fill-orange-500 text-orange-500"/>}
                    <span className="text-[10px] font-black uppercase tracking-tighter">{user.role}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-left">
                  <div className="flex flex-wrap gap-2">
                    {user.assignedProjects.map(p => (
                      <span key={p} className="text-[9px] font-black border-2 border-slate-50 px-2.5 py-1 rounded-lg uppercase text-slate-500 bg-white">
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => setUsers(users.filter(u => u.id !== user.id))} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. BIG SAAS MODAL - UPDATED WITH ALL ROLES */}
      {showAddModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-white/95 backdrop-blur-xl p-6">
          <div className="bg-white w-[900px] min-h-[650px] p-12 border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[48px] flex flex-col animate-in zoom-in-95 duration-300">
            
            <div className="flex justify-between items-center mb-12 bg-white">
              <h4 className="text-3xl font-black uppercase text-black tracking-tighter">Onboard New User</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-black p-2 transition-all">
                <X size={36}/>
              </button>
            </div>

            <form onSubmit={handleAddUser} className="flex-1 flex flex-col space-y-10 bg-white">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3 text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">User Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sanford" 
                    className="w-full p-6 border-2 border-slate-100 rounded-[24px] outline-none focus:border-black bg-white text-black font-bold shadow-sm transition-all placeholder:text-slate-200" 
                    onChange={e => setNewUser({...newUser, name: e.target.value})} 
                    required
                  />
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Work Email</label>
                  <input 
                    type="email" 
                    placeholder="e.g. sanford@ethinos.com" 
                    className="w-full p-6 border-2 border-slate-100 rounded-[24px] outline-none focus:border-black bg-white text-black font-bold shadow-sm transition-all placeholder:text-slate-200" 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 flex-1">
                <div className="space-y-3 text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Access Role</label>
                  <div className="relative">
                    <select 
                      className="w-full p-6 border-2 border-slate-100 rounded-[24px] outline-none bg-white text-black font-black uppercase text-xs appearance-none cursor-pointer focus:border-black shadow-sm transition-all" 
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                      value={newUser.role}
                    >
                      {/* Updated Role Options */}
                      <option value="Director">Director</option>
                      <option value="Snr Manager">Snr Manager</option>
                      <option value="Manager">Manager</option>
                      <option value="Snr Executive">Snr Executive</option>
                      <option value="Executive">Executive</option>
                      <option value="Intern">Intern</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-4 flex flex-col text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Project Portfolio</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                      type="text" 
                      placeholder="Search and assign projects..." 
                      className="w-full border-2 border-slate-100 rounded-[24px] pl-14 pr-4 py-5 text-sm bg-white text-black font-bold outline-none focus:border-black shadow-sm"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto border-2 border-slate-50 rounded-[32px] p-5 space-y-2 bg-slate-50/20 max-h-[220px]">
                    {filteredProjects.map(client => (
                      <div 
                        key={client.id} 
                        onClick={() => toggleProject(client.name)}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                          newUser.assignedProjects.includes(client.name) 
                            ? 'bg-black text-white shadow-xl translate-x-1' 
                            : 'bg-white border border-slate-100 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-tight">
                          {client.name}
                        </span>
                        {newUser.assignedProjects.includes(client.name) && <Check size={16} className="text-white" />}
                      </div>
                    ))}
                    {filteredProjects.length === 0 && (
                      <div className="text-center py-8 text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">No projects found</div>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-black text-white py-7 rounded-[28px] font-black uppercase tracking-[0.25em] text-xs hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] mt-4">
                Confirm & Create User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserView;