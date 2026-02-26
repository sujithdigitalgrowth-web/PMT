import React, { useState, useMemo } from 'react';
import { Star, Award, ChevronRight, Users, Briefcase } from 'lucide-react';

const EmployeeView = ({ users = [], clients = [] }) => {
  const [viewMode, setViewMode] = useState('full');
  const [searchValue, setSearchValue] = useState("");

  const displayGroups = useMemo(() => {
    const superAdmin = users.find(u => u.role === 'Super Admin');
    const directors = users.filter(u => u.role === 'Director');
    const pms = users.filter(u => ['Project Manager', 'Project Admin'].includes(u.role));

    const getStaff = (pm) => users.filter(u => 
      ['Snr Executive', 'Executive', 'Intern'].includes(u.role) && 
      u.assignedProjects.some(p => pm.assignedProjects.includes(p))
    );

    const directorPods = directors.map(d => {
      const pmsUnder = pms.filter(pm => pm.assignedProjects.some(p => d.assignedProjects.includes(p)));
      return { leader: d, pods: pmsUnder.map(pm => ({ manager: pm, staff: getStaff(pm) })) };
    });

    const assignedPMIds = new Set(directorPods.flatMap(g => g.pods.map(p => p.manager.id)));
    const orphanedPMs = pms.filter(pm => !assignedPMIds.has(pm.id));

    const allGroups = [{ leader: superAdmin, pods: orphanedPMs.map(pm => ({ manager: pm, staff: getStaff(pm) })) }, ...directorPods];

    return allGroups.filter(g => {
      if (!searchValue || viewMode === 'full') return true;
      if (viewMode === 'director') return g.leader.id === parseInt(searchValue);
      if (viewMode === 'client') return g.leader.assignedProjects.includes(searchValue) || g.pods.some(p => p.manager.assignedProjects.includes(searchValue));
      return true;
    });
  }, [viewMode, searchValue, users]);

  return (
    <div className="bg-white min-h-full font-sans p-6 text-left overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Agency Flow</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Horizontal Hierarchy</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {['full', 'client', 'director'].map(mode => (
              <button key={mode} onClick={() => {setViewMode(mode); setSearchValue("")}} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${viewMode === mode ? 'bg-green-500 text-white shadow-md' : 'text-slate-400'}`}>
                {mode === 'full' ? 'Show All' : mode}
              </button>
            ))}
          </div>
          <select className="border-2 border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:border-green-500 bg-white min-w-[200px]" onChange={(e) => setSearchValue(e.target.value)} value={searchValue}>
            <option value="">Filter Target...</option>
            {viewMode === 'client' && clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            {viewMode === 'director' && users.filter(u => ['Super Admin', 'Director'].includes(u.role)).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-10">
        <div className="flex flex-col gap-12 min-w-max">
          {displayGroups.map((group) => (
            <div key={group.leader.id} className="flex items-center gap-6">
              <div className={`bg-white border-2 p-5 rounded-[32px] w-56 flex flex-col items-center shrink-0 ${searchValue && group.leader.id === parseInt(searchValue) ? 'border-green-500 bg-green-50/20' : 'border-slate-200'}`}>
                <Award size={20} className={searchValue && group.leader.id === parseInt(searchValue) ? 'text-green-500' : 'text-black'} />
                <span className="text-[12px] font-black uppercase text-black tracking-tight mt-1">{group.leader.name}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">{group.leader.role}</span>
              </div>
              <ChevronRight className="text-slate-200" size={24} />
              <div className="flex flex-col gap-6 border-l-2 border-slate-50 pl-8">
                {group.pods.map((pod) => (
                  <div key={pod.manager.id} className="flex items-center gap-6">
                    <div className={`bg-white border-2 p-4 rounded-[24px] shadow-sm w-48 shrink-0 ${searchValue && pod.manager.assignedProjects.includes(searchValue) ? 'border-green-500' : 'border-slate-100'}`}>
                      <Star size={16} className="text-orange-400 fill-orange-400" />
                      <span className="text-[10px] font-black text-black uppercase block mt-1">{pod.manager.name}</span>
                    </div>
                    {/* SCROLLABLE STAFF ROW FOR 100+ USERS */}
                    <div className="flex gap-3 overflow-x-auto max-w-[800px] pb-2 no-scrollbar">
                      {pod.staff.map(s => (
                        <div key={s.id} className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs w-40 shrink-0 hover:border-green-500 transition-all">
                          <span className="text-[10px] font-black text-black uppercase block">{s.name}</span>
                          <span className="text-[7px] font-bold text-slate-400 uppercase">{s.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeView;