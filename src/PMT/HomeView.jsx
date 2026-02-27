import React from 'react';
import { Briefcase, Clock, Activity, AlertTriangle, ChevronRight, TrendingUp } from 'lucide-react';

const HomeView = ({ accessibleClients, allTasks, clientLogs, setSelectedClient }) => {
  return (
    <div className="w-full space-y-8 p-6 bg-slate-100 min-h-screen">
      
      {/* 1. STATISTICS ROW - Clean, Card-Based Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Clients', value: accessibleClients.length, icon: <Briefcase size={16} className="text-blue-600"/>, color: 'border-blue-500', trend: '↑ 12% from last month' },
          { label: 'Open Tasks', value: allTasks.filter(t => t.status !== 'Done').length, icon: <Clock size={16} className="text-green-600"/>, color: 'border-green-500', trend: '— No change' },
          { label: 'WIP', value: allTasks.filter(t => t.status === 'WIP').length, icon: <Activity size={16} className="text-blue-500"/>, color: 'border-blue-400', trend: 'All tasks completed' },
          { label: 'Pending', value: allTasks.filter(t => t.status === 'Pending').length, icon: <AlertTriangle size={16} className="text-orange-500"/>, color: 'border-orange-400', trend: 'Awaiting review' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-40 transition-hover hover:shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
              <div className="p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs font-medium ${stat.trend.includes('↑') ? 'text-green-500' : 'text-slate-400'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. TASK PIPELINES GRID - Modern Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {accessibleClients.map(client => (
          <div key={client.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300">
            {/* Card Header */}
            <div className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-semibold text-slate-900">{client.name}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-semibold ${
                  (clientLogs[client.id] || []).length > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {(clientLogs[client.id] || []).length > 0 ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedClient(client)} 
                className="flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg"
              >
                View All <ChevronRight size={14}/>
              </button>
            </div>
            
            {/* Card Content - Tasks List */}
            <div className="flex-1 p-5 pt-0">
              <div className="bg-slate-50/50 rounded-2xl p-4 min-h-[140px] flex flex-col justify-center">
                {(clientLogs[client.id] || []).filter(t => t.status !== 'Done').length > 0 ? (
                  <div className="space-y-4">
                    {(clientLogs[client.id] || []).filter(t => t.status !== 'Done').slice(0, 2).map(task => (
                      <div key={task.id} className="flex items-start gap-3 group">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${task.status === 'WIP' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-orange-500'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-600 leading-snug line-clamp-2">{task.comment}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[8px] font-semibold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">New</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-2 opacity-40">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <Briefcase size={16} className="text-slate-400"/>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">No active tasks for this client</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-50 flex items-center gap-2">
              <Clock size={12} className="text-slate-400"/>
              <span className="text-xs font-medium text-slate-500">
                Last activity {(clientLogs[client.id] || []).length > 0 ? 'recently' : '1 week ago'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeView;