import React from 'react';
import { Briefcase, Clock, Activity, AlertTriangle } from 'lucide-react';

const HomeView = ({ accessibleClients, allTasks, clientLogs, setSelectedClient }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-12 font-black uppercase text-black">
      {/* 1. STATISTICS ROW */}
      <div className="grid grid-cols-4 gap-6">
        <div className="border-2 border-black p-6 rounded-2xl bg-white flex flex-col justify-between h-32 shadow-sm">
          <div className="flex justify-between items-start">
            <h4 className="text-[10px] text-slate-400">Total Clients</h4>
            <Briefcase size={16} className="text-slate-200"/>
          </div>
          <p className="text-4xl">{accessibleClients.length}</p>
        </div>
        
        <div className="border-2 border-black p-6 rounded-2xl bg-white flex flex-col justify-between h-32 shadow-sm">
          <div className="flex justify-between items-start">
            <h4 className="text-[10px] text-slate-400">Open Tasks</h4>
            <Clock size={16} className="text-slate-200"/>
          </div>
          <p className="text-4xl">{allTasks.filter(t => t.status !== 'Done').length}</p>
        </div>

        <div className="border-2 border-black p-6 rounded-2xl bg-white flex flex-col justify-between h-32 text-blue-500 shadow-sm border-blue-500">
          <div className="flex justify-between items-start">
            <h4 className="text-[10px]">WIP</h4>
            <Activity size={16} className="text-blue-100"/>
          </div>
          <p className="text-4xl">{allTasks.filter(t => t.status === 'WIP').length}</p>
        </div>

        <div className="border-2 border-black p-6 rounded-2xl bg-white flex flex-col justify-between h-32 text-orange-500 shadow-sm border-orange-500">
          <div className="flex justify-between items-start">
            <h4 className="text-[10px]">Pending</h4>
            <AlertTriangle size={16} className="text-orange-100"/>
          </div>
          <p className="text-4xl">{allTasks.filter(t => t.status === 'Pending').length}</p>
        </div>
      </div>

      {/* 2. TASK PIPELINES GRID */}
      <div className="grid grid-cols-2 gap-8">
        {accessibleClients.map(client => (
          <div key={client.id} className="border-2 border-black rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50 p-4 border-b-2 border-black flex justify-between items-center font-black uppercase text-black">
              <h4 className="text-sm">{client.name}</h4>
              <button 
                onClick={() => setSelectedClient(client)} 
                className="text-[9px] border border-black px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition-all"
              >
                View All
              </button>
            </div>
            
            <div className="p-4 space-y-3 bg-white">
              {(clientLogs[client.id] || []).filter(t => t.status !== 'Done').slice(0, 5).length > 0 ? (
                (clientLogs[client.id] || []).filter(t => t.status !== 'Done').slice(0, 5).map(task => (
                  <div key={task.id} className="flex gap-3 border-b border-slate-50 pb-2 last:border-0 font-bold bg-white text-black">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${task.status === 'WIP' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                    <div className="flex-1 text-[11px] leading-tight text-left lowercase">
                      <p>{task.comment}</p>
                      <span className="text-[8px] uppercase font-black text-slate-300">{task.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-[10px] text-slate-300 font-bold italic">No active tasks for this client</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeView;