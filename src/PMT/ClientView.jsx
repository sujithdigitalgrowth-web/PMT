import React, { useState } from 'react';
import { Search, ChevronLeft, Plus, Clock, Activity, CheckCircle, X, Star, Edit2, Trash2 } from 'lucide-react';
import DatePicker from "react-datepicker";
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

const ClientView = ({ 
  selectedClient, 
  setSelectedClient, 
  clients = [], 
  setClients, 
  clientLogs = {}, 
  setClientLogs, 
  clientSearch = "", 
  setClientSearch,
  users = [],
  setUsers,
  currentUser 
}) => {
  // 1. DEFINE ROLES FIRST TO PREVENT CRASHES
  const managementRoles = ['Super Admin', 'Director', 'Manager'];
  const executionRoles = ['Snr Executive', 'Executive', 'Intern'];
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [empSearch, setEmpSearch] = useState("");
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskComment, setNewTaskComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editField, setEditField] = useState(""); 
  const [tempValue, setTempValue] = useState("");

  // 2. PERMISSION LOGIC
  const isManagement = managementRoles.includes(currentUser?.role);
  const canAddClient = currentUser?.role === 'Super Admin' || currentUser?.role === 'Director';

  const handleSaveInline = (logId) => {
    const updated = (clientLogs[selectedClient.id] || []).map(l => 
      l.id === logId ? { ...l, [editField]: tempValue } : l
    );
    setClientLogs({ ...clientLogs, [selectedClient.id]: updated });
    setEditingId(null);
  };

  const getProjectStaff = (clientName) => {
    const staff = (users || []).filter(u => u.assignedProjects?.includes(clientName));
    return {
      admins: staff.filter(u => managementRoles.includes(u.role)),
      employees: staff.filter(u => executionRoles.includes(u.role))
    };
  };

  const getTaskCounts = (clientId) => {
    const logs = clientLogs[clientId] || [];
    return {
      open: logs.filter(l => l.status === 'Pending').length,
      wip: logs.filter(l => l.status === 'WIP').length,
      done: logs.filter(l => l.status === 'Done').length
    };
  };

  const addTaskEntry = (e) => {
    e.preventDefault();
    if (!newTaskComment) return;
    const newLog = {
      id: Date.now(),
      date: format(selectedDate, 'do MMM yyyy'),
      comment: newTaskComment,
      result: '', 
      status: 'Pending',
      creatorRole: currentUser?.role || 'Employee'
    };
    setClientLogs({
      ...clientLogs,
      [selectedClient.id]: [newLog, ...(clientLogs[selectedClient.id] || [])]
    });
    setNewTaskComment("");
    setShowTaskForm(false);
  };

  const handleSaveClient = (e) => {
    e.preventDefault();
    if (!newClientName) return;
    const newClient = { id: `client-${Date.now()}`, name: newClientName, industry: "General" };
    setClients([...clients, newClient]);
    const updatedUsers = users.map(u => {
      if (selectedAdmins.includes(u.id) || selectedEmployees.includes(u.id)) {
        return { ...u, assignedProjects: [...(u.assignedProjects || []), newClientName] };
      }
      return u;
    });
    if(setUsers) setUsers(updatedUsers);
    setNewClientName(""); setSelectedAdmins([]); setSelectedEmployees([]); setShowClientModal(false);
  };

  if (selectedClient) {
    const counts = getTaskCounts(selectedClient.id);
    return (
      <div className="bg-white min-h-full font-sans text-left animate-in fade-in duration-300">
        <div className="flex items-center gap-6 mb-8 bg-white">
          <button onClick={() => setSelectedClient(null)} className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400 hover:text-black transition-all">
            <ChevronLeft size={16}/> Back
          </button>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{selectedClient.name}</h2>
        </div>

        <div className="flex justify-between items-center mb-6 bg-white">
          <div className="flex items-center gap-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Activity Log</h3>
            <div className="flex items-center gap-4 bg-slate-50/50 px-4 py-1.5 rounded-full border border-slate-100">
              <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                <Clock size={12} className="text-orange-400" /><span className="text-xs font-black text-slate-900">{counts.open}</span>
              </div>
              <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                <Activity size={12} className="text-blue-400" /><span className="text-xs font-black text-slate-900">{counts.wip}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" /><span className="text-xs font-black text-slate-900">{counts.done}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowTaskForm(true)} className="bg-black text-white px-5 py-2 rounded-xl font-bold uppercase text-[11px] hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg">
            <Plus size={16}/> Add Task
          </button>
        </div>

        <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500">
                <th className="px-6 py-4 w-[12%] text-left">Date</th>
                <th className="px-6 py-4 w-[12%] text-left border-l border-slate-50">Status</th>
                <th className="px-6 py-4 w-[33%] text-left border-l border-slate-50">Task</th>
                <th className="px-6 py-4 w-[33%] text-left border-l border-slate-50">Update</th>
                <th className="px-6 py-4 w-[10%] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {(clientLogs[selectedClient.id] || []).map(log => {
                const canDelete = isManagement || !managementRoles.includes(log.creatorRole);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/30 transition-colors bg-white group">
                    <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase">{log.date}</td>
                    <td className="px-6 py-5 border-l border-slate-50">
                      <select className="text-[9px] border border-slate-200 rounded-lg px-2 py-1 font-black uppercase bg-white text-black outline-none" value={log.status} onChange={e => {
                        const updated = clientLogs[selectedClient.id].map(l => l.id === log.id ? { ...l, status: e.target.value } : l);
                        setClientLogs({ ...clientLogs, [selectedClient.id]: updated });
                      }}>
                        <option value="Pending">Pending</option><option value="WIP">WIP</option><option value="Done">Done</option>
                      </select>
                    </td>
                    <td className="px-6 py-5 align-top border-l border-slate-50">
                      {editingId === log.id && editField === 'comment' ? (
                        <textarea className="w-full p-2 border-2 border-black rounded-xl text-sm bg-white text-black outline-none" value={tempValue} autoFocus onBlur={() => handleSaveInline(log.id)} onChange={(e) => setTempValue(e.target.value)} />
                      ) : (
                        <div className="flex items-start justify-between group/cell">
                          <span className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{log.comment}</span>
                          <button onClick={() => { setEditingId(log.id); setEditField('comment'); setTempValue(log.comment); }} className="opacity-0 group-hover/cell:opacity-100 p-1 text-slate-300 hover:text-black"><Edit2 size={12}/></button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 align-top border-l border-slate-50">
                      {editingId === log.id && editField === 'result' ? (
                        <textarea className="w-full p-2 border-2 border-black rounded-xl text-sm bg-white text-black outline-none" value={tempValue} autoFocus onBlur={() => handleSaveInline(log.id)} onChange={(e) => setTempValue(e.target.value)} />
                      ) : (
                        <div className="flex items-start justify-between group/cell">
                          <span className="text-sm font-medium text-slate-400 italic whitespace-pre-wrap">{log.result || "No update..."}</span>
                          <button onClick={() => { setEditingId(log.id); setEditField('result'); setTempValue(log.result || ""); }} className="opacity-0 group-hover/cell:opacity-100 p-1 text-slate-300 hover:text-black"><Edit2 size={12}/></button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {canDelete && (
                        <button onClick={() => { if(window.confirm("Delete?")) { const upd = clientLogs[selectedClient.id].filter(l => l.id !== log.id); setClientLogs({...clientLogs, [selectedClient.id]: upd}); } }} className="p-2 text-slate-200 hover:text-red-500"><Trash2 size={14}/></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Task Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
            <div className="bg-white w-[850px] p-12 border border-slate-100 shadow-2xl rounded-[48px] animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-10">
                <h4 className="text-3xl font-black uppercase text-black">New Task</h4>
                <button onClick={() => setShowTaskForm(false)} className="text-slate-300 hover:text-black"><X size={36}/></button>
              </div>
              <div className="flex gap-12">
                <div className="border-2 border-slate-50 rounded-[32px] p-4 bg-white shadow-sm h-fit">
                  <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} inline />
                </div>
                <div className="flex-1 flex flex-col space-y-6">
                  <textarea placeholder="Describe task..." className="w-full h-64 p-8 border-2 border-slate-100 rounded-[32px] text-lg font-bold outline-none focus:border-black bg-white text-black transition-all shadow-sm" value={newTaskComment} onChange={e => setNewTaskComment(e.target.value)} />
                  <button onClick={addTaskEntry} className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl">Confirm Task</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- GRID VIEW ---
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

  return (
    <div className="space-y-6 bg-white min-h-full font-sans text-left">
      <div className="flex justify-end items-center gap-4 mb-10">
        <div className="relative w-96 bg-white">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" placeholder="Filter Clients..." className="w-full border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none bg-white text-black focus:border-black shadow-sm" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
        </div>
        {canAddClient && (
          <button onClick={() => setShowClientModal(true)} className="bg-black text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg">
            <Plus size={18}/> Add Client
          </button>
        )}
      </div>

      {showClientModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
          <div className="bg-white w-[900px] min-h-[650px] p-12 border border-slate-100 shadow-2xl rounded-[48px] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-3xl font-black uppercase text-black">Onboard Client</h4>
              <button onClick={() => setShowClientModal(false)} className="text-slate-300 hover:text-black"><X size={36}/></button>
            </div>
            <form onSubmit={handleSaveClient} className="flex-1 flex flex-col space-y-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Company Name</label>
                <input type="text" className="w-full p-6 border-2 border-slate-100 rounded-[24px] text-lg font-black bg-white text-black outline-none focus:border-black shadow-sm" placeholder="e.g. Vansaar" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-12 flex-1 min-h-0">
                <div className="space-y-4 flex flex-col">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Leadership</label>
                  <div className="flex-1 overflow-y-auto border-2 border-slate-50 rounded-[32px] p-6 space-y-3 bg-slate-50/20">
                    {users.filter(u => managementRoles.includes(u.role)).map(admin => (
                      <label key={admin.id} className="flex items-center justify-between p-4 bg-white rounded-2xl cursor-pointer border-2 border-transparent hover:border-slate-100 shadow-sm transition-all">
                        <span className="text-xs font-black text-black uppercase">{admin.name}</span>
                        <input type="checkbox" className="w-5 h-5 accent-black" checked={selectedAdmins.includes(admin.id)} onChange={(e) => e.target.checked ? setSelectedAdmins([...selectedAdmins, admin.id]) : setSelectedAdmins(selectedAdmins.filter(id => id !== admin.id))}/>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 flex flex-col">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Executives</label>
                  <div className="flex-1 overflow-y-auto border-2 border-slate-50 rounded-[32px] p-6 space-y-3 bg-slate-50/20">
                    {users.filter(u => executionRoles.includes(u.role)).map(emp => (
                      <label key={emp.id} className="flex items-center justify-between p-4 bg-white rounded-2xl cursor-pointer border-2 border-transparent hover:border-slate-100 shadow-sm transition-all">
                        <span className="text-xs font-black text-black uppercase">{emp.name}</span>
                        <input type="checkbox" className="w-5 h-5 accent-black" checked={selectedEmployees.includes(emp.id)} onChange={(e) => e.target.checked ? setSelectedEmployees([...selectedEmployees, emp.id]) : setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id))}/>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-black text-white py-7 rounded-[28px] font-black uppercase tracking-[0.25em] shadow-2xl">Confirm Onboarding</button>
            </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="border border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-8 py-5 text-left">Account</th>
              <th className="px-8 py-5 text-left">Leadership</th>
              <th className="px-8 py-5 text-left">Execution Team</th>
              <th className="px-8 py-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredClients.map(c => {
              const counts = getTaskCounts(c.id); const staff = getProjectStaff(c.name);
              return (
                <tr key={c.id} onClick={() => setSelectedClient(c)} className="group cursor-pointer hover:bg-slate-50/30 transition-all bg-white">
                  <td className="px-8 py-8"><span className="text-lg font-black text-black uppercase tracking-tight group-hover:text-black">{c.name}</span></td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-1.5">
                      {staff.admins.map(admin => (
                        <div key={admin.id} className="flex items-center gap-2">
                          <Star size={12} className="text-orange-400 fill-orange-400" />
                          <span className="text-[10px] font-black text-black uppercase">{admin.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex -space-x-3">
                      {staff.employees.map(emp => (
                        <div key={emp.id} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400 uppercase" title={emp.name}>{emp.name.charAt(0)}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex gap-4 justify-end">
                      <div className="flex items-center gap-2 bg-white border-2 border-slate-50 px-4 py-2 rounded-2xl shadow-sm"><Clock size={14} className="text-orange-400" /><span className="text-xs font-black text-black">{counts.open}</span></div>
                      <div className="flex items-center gap-2 bg-white border-2 border-slate-50 px-4 py-2 rounded-2xl shadow-sm"><Activity size={14} className="text-blue-400" /><span className="text-xs font-black text-black">{counts.wip}</span></div>
                      <div className="flex items-center gap-2 bg-white border-2 border-slate-50 px-4 py-2 rounded-2xl shadow-sm"><CheckCircle size={14} className="text-green-500" /><span className="text-xs font-black text-black">{counts.done}</span></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientView;