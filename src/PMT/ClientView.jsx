import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, Plus, Clock, Activity, CheckCircle, X, Star, Edit2, Trash2, Eye, Crown, AlertCircle } from 'lucide-react';
import DatePicker from "react-datepicker";
import { format, subDays, parse } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

const ClientView = ({ 
  selectedClient, setSelectedClient, clients = [], setClients, 
  clientLogs = {}, setClientLogs, clientSearch = "", setClientSearch,
  users = [], setUsers, currentUser, taskCategories = []
}) => {
  const managementRoles = ['Super Admin', 'Director', 'Business Head', 'Snr Manager', 'Manager', 'Project Manager', 'CSM'];
  const executionRoles = ['Snr Executive', 'Executive', 'Intern'];
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskComment, setNewTaskComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editField, setEditField] = useState(""); 
  const [tempValue, setTempValue] = useState("");
  const [adminQuery, setAdminQuery] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [timerTick, setTimerTick] = useState(Date.now());
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [taskCategoryQuery, setTaskCategoryQuery] = useState("");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [taskFormError, setTaskFormError] = useState("");
  const [newTaskRepeat, setNewTaskRepeat] = useState('Once');
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportUrlInput, setReportUrlInput] = useState("");
  const [isEditingReportLink, setIsEditingReportLink] = useState(false);
  const [showAddCustomReport, setShowAddCustomReport] = useState(false);
  const [customReportName, setCustomReportName] = useState("");
  const [customReportUrl, setCustomReportUrl] = useState("");
  const [editingCustomReportId, setEditingCustomReportId] = useState(null);

  const isManagement = managementRoles.includes(currentUser?.role);
  const canAddClient = currentUser?.role === 'Super Admin' || currentUser?.role === 'Director';

  useEffect(() => {
    const hasRunningTimers = Object.values(clientLogs || {}).some(logs =>
      (logs || []).some(log => log.timerState === 'running')
    );

    if (!hasRunningTimers) return;
    const intervalId = setInterval(() => setTimerTick(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [clientLogs]);

  const formatDuration = (milliseconds = 0) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const getElapsedMs = (log) => {
    const baseElapsed = log.elapsedMs || 0;
    if (log.timerState === 'running' && log.timerStartedAt) {
      return baseElapsed + Math.max(0, timerTick - log.timerStartedAt);
    }
    return baseElapsed;
  };

  const updateTaskLog = (logId, updater) => {
    const updatedLogs = (clientLogs[selectedClient.id] || []).map(log =>
      log.id === logId ? updater(log) : log
    );
    setClientLogs({ ...clientLogs, [selectedClient.id]: updatedLogs });
  };

  const startTaskTimer = (logId) => {
    updateTaskLog(logId, (log) => {
      const shouldReset = log.timerState === 'stopped';
      return {
        ...log,
        timerState: 'running',
        timerStartedAt: Date.now(),
        elapsedMs: shouldReset ? 0 : (log.elapsedMs || 0),
        timeTaken: shouldReset ? null : log.timeTaken
      };
    });
  };

  const pauseTaskTimer = (logId) => {
    updateTaskLog(logId, (log) => {
      if (log.timerState !== 'running' || !log.timerStartedAt) return log;
      const elapsedMs = (log.elapsedMs || 0) + (Date.now() - log.timerStartedAt);
      return {
        ...log,
        timerState: 'paused',
        timerStartedAt: null,
        elapsedMs,
        timeTaken: formatDuration(elapsedMs)
      };
    });
  };

  const stopTaskTimer = (logId) => {
    updateTaskLog(logId, (log) => {
      const elapsedMs = log.timerState === 'running' && log.timerStartedAt
        ? (log.elapsedMs || 0) + (Date.now() - log.timerStartedAt)
        : (log.elapsedMs || 0);

      return {
        ...log,
        timerState: 'stopped',
        timerStartedAt: null,
        elapsedMs,
        timeTaken: formatDuration(elapsedMs)
      };
    });
  };

  // --- CORE LOGIC (UNCHANGED) ---
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
    const twoDaysAgo = subDays(new Date(), 2);

    return {
      open: logs.filter(l => l.status === 'Pending').length,
      wip: logs.filter(l => l.status === 'WIP').length,
      done: logs.filter(l => l.status === 'Done').length,
      // Logic for pending tasks from last 2 days
      recentPending: logs.filter(l => {
        if (l.status !== 'Pending') return false;
        try {
          const taskDate = parse(l.date, 'do MMM yyyy', new Date());
          return taskDate >= twoDaysAgo;
        } catch (e) { return false; }
      }).length
    };
  };

  const addTaskEntry = (e) => {
    e.preventDefault();
    const trimmedComment = newTaskComment.trim();
    if (!trimmedComment || !newTaskCategory) {
      setTaskFormError('Task description and task category are required.');
      return;
    }
    const newLog = {
      id: Date.now(),
      date: format(selectedDate, 'do MMM yyyy'),
      comment: trimmedComment, result: '', status: 'Pending',
      creatorId: currentUser?.id || null,
      creatorName: currentUser?.name || 'Unassigned',
      creatorRole: currentUser?.role || 'Employee',
      category: newTaskCategory,
      repeatFrequency: newTaskRepeat,
      timerState: 'idle',
      timerStartedAt: null,
      elapsedMs: 0,
      timeTaken: null
    };
    setClientLogs({
      ...clientLogs,
      [selectedClient.id]: [newLog, ...(clientLogs[selectedClient.id] || [])]
    });
    setNewTaskComment("");
    setNewTaskCategory("");
    setTaskCategoryQuery("");
    setShowCategoryMenu(false);
    setTaskFormError("");
    setNewTaskRepeat('Once');
    setShowTaskForm(false);
  };

  const handleSaveClient = (e) => {
    e.preventDefault();
    if (!newClientName) return;
    const newClient = { id: `client-${Date.now()}`, name: newClientName };
    setClients([...clients, newClient]);
    const updatedUsers = users.map(u => {
      if (selectedAdmins.includes(u.id) || selectedEmployees.includes(u.id)) {
        return { ...u, assignedProjects: [...(u.assignedProjects || []), newClientName] };
      }
      return u;
    });
    if(setUsers) setUsers(updatedUsers);
    setNewClientName(""); setSelectedAdmins([]); setSelectedEmployees([]); 
    setAdminQuery(""); setTeamQuery(""); setShowClientModal(false);
  };

  const handleSaveDailyReportLink = () => {
    if (!selectedClient) return;
    const trimmed = reportUrlInput.trim();
    if (!trimmed) return;

    const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const updatedClients = clients.map(client =>
      client.id === selectedClient.id ? { ...client, dailyReportUrl: normalizedUrl } : client
    );

    setClients(updatedClients);
    const updatedSelected = updatedClients.find(client => client.id === selectedClient.id);
    if (updatedSelected) setSelectedClient(updatedSelected);
    setIsEditingReportLink(false);
  };

  const handleSaveCustomReport = () => {
    if (!selectedClient) return;
    const trimmedName = customReportName.trim();
    const trimmedUrl = customReportUrl.trim();
    if (!trimmedName || !trimmedUrl) return;

    const normalizedUrl = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
    const selectedClientRecord = clients.find(client => client.id === selectedClient.id) || selectedClient;
    const existingReports = selectedClientRecord.customReports || [];

    let nextReports = existingReports;
    if (editingCustomReportId) {
      nextReports = existingReports.map(report =>
        report.id === editingCustomReportId ? { ...report, name: trimmedName, url: normalizedUrl } : report
      );
    } else {
      if (existingReports.length >= 7) return;
      nextReports = [...existingReports, { id: `report-${Date.now()}`, name: trimmedName, url: normalizedUrl }];
    }

    const updatedClients = clients.map(client =>
      client.id === selectedClient.id ? { ...client, customReports: nextReports } : client
    );

    setClients(updatedClients);
    const updatedSelected = updatedClients.find(client => client.id === selectedClient.id);
    if (updatedSelected) setSelectedClient(updatedSelected);

    setShowAddCustomReport(false);
    setCustomReportName("");
    setCustomReportUrl("");
    setEditingCustomReportId(null);
  };

  // --- 1. DEEP VIEW (SINGLE CLIENT) ---
  if (selectedClient) {
    const stats = getTaskCounts(selectedClient.id);
    const filteredTaskLogs = (clientLogs[selectedClient.id] || []).filter(log =>
      taskStatusFilter === 'All' ? true : log.status === taskStatusFilter
    );
    const selectedClientRecord = clients.find(client => client.id === selectedClient.id) || selectedClient;
    const dailyReportUrl = selectedClientRecord?.dailyReportUrl || '';
    const customReports = selectedClientRecord?.customReports || [];
    const availableTaskCategories = taskCategories.length ? taskCategories : ['General'];
    const filteredTaskCategories = availableTaskCategories.filter(category =>
      category.toLowerCase().includes(taskCategoryQuery.toLowerCase())
    );
    return (
      <div className="bg-[#f8fafc] min-h-full p-4 font-sans animate-in fade-in duration-500 text-left space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedClient(null)} className="p-2 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-100 shadow-sm">
              <ChevronLeft size={18} className="text-slate-600"/>
            </button>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{selectedClient.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReportUrlInput(dailyReportUrl);
                setIsEditingReportLink(!dailyReportUrl);
                setShowReportsModal(true);
              }}
              className="bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg font-semibold text-xs hover:bg-slate-50 transition-all"
            >
              Reports
            </button>
            <select
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
            >
              <option value="All">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="WIP">WIP</option>
              <option value="Done">Completed</option>
            </select>
            <button
              onClick={() => {
                setSelectedDate(new Date());
                setNewTaskComment('');
                setNewTaskCategory('');
                setTaskCategoryQuery('');
                setShowCategoryMenu(false);
                setTaskFormError('');
                setNewTaskRepeat('Once');
                setShowTaskForm(true);
              }}
              className="bg-blue-600 text-white px-3.5 py-2 rounded-lg font-semibold text-xs hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus size={14}/> Add Task
            </button>
          </div>
        </div>

        {/* --- OVERALL NUMBERS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between min-h-[62px]">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Pending</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{stats.open}</p>
            </div>
            <div className="p-1 bg-orange-50 rounded-md"><Clock size={12} className="text-orange-500"/></div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between min-h-[62px]">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">WIP Tasks</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{stats.wip}</p>
            </div>
            <div className="p-1 bg-blue-50 rounded-md"><Activity size={12} className="text-blue-500"/></div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between min-h-[62px]">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{stats.done}</p>
            </div>
            <div className="p-1 bg-emerald-50 rounded-md"><CheckCircle size={12} className="text-emerald-500"/></div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-red-100 shadow-sm flex items-center justify-between min-h-[62px]">
            <div>
              <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Last 48H Pending</p>
              <p className="text-base font-bold text-red-600 mt-0.5">{stats.recentPending}</p>
            </div>
            <div className="p-1 bg-red-50 rounded-md"><AlertCircle size={12} className="text-red-500"/></div>
          </div>
        </div>

        {/* Task Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[48%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Task Category</th>
                <th className="px-4 py-2 text-left">Task Description</th>
                <th className="px-2 py-2 text-right">Timer</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTaskLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-all group align-top">
                  <td className="px-3 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{log.date}</td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <select 
                      className={`text-xs border-none rounded-md px-2 py-1 font-semibold outline-none cursor-pointer min-w-[78px] ${
                        log.status === 'Done' ? 'bg-emerald-100 text-emerald-600' : 
                        log.status === 'WIP' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                      }`} 
                      value={log.status} 
                      onChange={e => {
                        const updated = clientLogs[selectedClient.id].map(l => l.id === log.id ? { ...l, status: e.target.value } : l);
                        setClientLogs({ ...clientLogs, [selectedClient.id]: updated });
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="WIP">WIP</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <select
                      className="text-xs border border-slate-200 rounded-md px-2 py-1 font-semibold outline-none cursor-pointer min-w-[96px] bg-white text-slate-700"
                      value={log.category || taskCategories[0] || 'General'}
                      onChange={e => {
                        const updated = clientLogs[selectedClient.id].map(l => l.id === log.id ? { ...l, category: e.target.value } : l);
                        setClientLogs({ ...clientLogs, [selectedClient.id]: updated });
                      }}
                    >
                      {(taskCategories.length ? taskCategories : ['General']).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === log.id && editField === 'comment' ? (
                      <textarea className="w-full p-3 border border-blue-600 rounded-lg text-sm font-medium bg-white outline-none" value={tempValue} autoFocus onBlur={() => handleSaveInline(log.id)} onChange={(e) => setTempValue(e.target.value)} />
                    ) : (
                      <div className="flex items-start justify-between group/cell">
                        <span className="text-sm font-medium text-slate-700 leading-5 pr-3 break-words">{log.comment}</span>
                        <button onClick={() => { setEditingId(log.id); setEditField('comment'); setTempValue(log.comment); }} className="opacity-0 group-hover/cell:opacity-100 p-1 text-blue-400"><Edit2 size={12}/></button>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => startTaskTimer(log.id)}
                          className="w-[46px] px-1 py-0.5 text-[8px] font-semibold rounded-md border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => pauseTaskTimer(log.id)}
                          className="w-[46px] px-1 py-0.5 text-[8px] font-semibold rounded-md border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all"
                        >
                          Pause
                        </button>
                        <button
                          onClick={() => stopTaskTimer(log.id)}
                          className="w-[46px] px-1 py-0.5 text-[8px] font-semibold rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all"
                        >
                          Stop
                        </button>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 mt-0.5">{formatDuration(getElapsedMs(log))}</span>
                      {log.timerState === 'stopped' && log.timeTaken && (
                        <span className="text-[8px] font-medium text-emerald-600">Time: {log.timeTaken}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if(window.confirm("Are you sure you want to delete this task?")) { const upd = clientLogs[selectedClient.id].filter(l => l.id !== log.id); setClientLogs({...clientLogs, [selectedClient.id]: upd}); } }} className="p-1.5 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showReportsModal && (
          <div className="fixed inset-0 z-[650] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl border border-slate-200 rounded-2xl shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-900">{selectedClient.name} Reports</h4>
                <button
                  onClick={() => setShowReportsModal(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/70">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Daily Reports</p>

                  {!isEditingReportLink && dailyReportUrl && (
                    <div className="flex items-center gap-2">
                      <a
                        href={dailyReportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View Report
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsEditingReportLink(true)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}

                  {!isEditingReportLink && !dailyReportUrl && (
                    <button
                      type="button"
                      onClick={() => setIsEditingReportLink(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Add Link
                    </button>
                  )}
                </div>

                {isEditingReportLink && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="url"
                      value={reportUrlInput}
                      onChange={(e) => setReportUrlInput(e.target.value)}
                      placeholder="Paste report URL"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleSaveDailyReportLink}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingReportLink(false);
                        setReportUrlInput(dailyReportUrl);
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 border border-slate-200 rounded-lg p-3 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Custom Reports</p>
                  {!showAddCustomReport && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCustomReport(true);
                        setEditingCustomReportId(null);
                        setCustomReportName('');
                        setCustomReportUrl('');
                      }}
                      disabled={customReports.length >= 7}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Report
                    </button>
                  )}
                </div>

                {showAddCustomReport && (
                  <div className="grid grid-cols-1 md:grid-cols-[1fr,1.2fr,auto,auto] gap-2">
                    <input
                      type="text"
                      value={customReportName}
                      onChange={(e) => setCustomReportName(e.target.value)}
                      placeholder="Report name"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                    />
                    <input
                      type="url"
                      value={customReportUrl}
                      onChange={(e) => setCustomReportUrl(e.target.value)}
                      placeholder="Report URL"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomReport}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCustomReport(false);
                        setCustomReportName('');
                        setCustomReportUrl('');
                        setEditingCustomReportId(null);
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {customReports.length > 0 ? (
                    customReports.map(report => (
                      <div key={report.id} className="flex items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-sm font-semibold text-slate-700 truncate">{report.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            View Report
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddCustomReport(true);
                              setEditingCustomReportId(report.id);
                              setCustomReportName(report.name);
                              setCustomReportUrl(report.url);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-medium text-slate-500">No custom reports added yet.</p>
                  )}
                </div>

                <p className="text-[11px] font-medium text-slate-500">You can add up to 7 reports.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Task */}
        {showTaskForm && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/10 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-5xl p-8 border border-slate-200 shadow-xl rounded-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-slate-900">New Task</h4>
                <button
                  onClick={() => {
                    setShowTaskForm(false);
                    setTaskFormError('');
                    setShowCategoryMenu(false);
                  }}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                >
                  <X size={18}/>
                </button>
              </div>
              <form onSubmit={addTaskEntry} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Select</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDate(new Date())}
                          className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDate(new Date(new Date().setDate(new Date().getDate() + 1)))}
                          className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                        >
                          Tomorrow
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDate(new Date(new Date().setDate(new Date().getDate() + 7)))}
                          className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                        >
                          Next Week
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDate(new Date(new Date().setDate(new Date().getDate() + 30)))}
                          className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                        >
                          Next Month
                        </button>
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} inline />
                    </div>
                  </div>
                  <div className="flex-1 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task Category <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search and select category"
                          className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                          value={taskCategoryQuery}
                          onFocus={() => setShowCategoryMenu(true)}
                          onChange={(e) => {
                            setTaskCategoryQuery(e.target.value);
                            setNewTaskCategory('');
                            setShowCategoryMenu(true);
                            if (taskFormError) setTaskFormError('');
                          }}
                        />
                        {showCategoryMenu && (
                          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                            {filteredTaskCategories.length ? (
                              filteredTaskCategories.map(category => (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={() => {
                                    setNewTaskCategory(category);
                                    setTaskCategoryQuery(category);
                                    setShowCategoryMenu(false);
                                    if (taskFormError) setTaskFormError('');
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm font-medium text-black bg-white hover:bg-slate-50 transition-all"
                                >
                                  {category}
                                </button>
                              ))
                            ) : (
                              <p className="px-3 py-2 text-sm text-slate-500">No categories found</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task Description <span className="text-red-500">*</span></label>
                      <textarea
                        placeholder="Describe the task details"
                        className="w-full h-40 p-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 ring-blue-500/20 resize-none bg-slate-100"
                        value={newTaskComment}
                        onChange={e => {
                          setNewTaskComment(e.target.value);
                          if (taskFormError) setTaskFormError('');
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Repeat Frequency</label>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all" style={newTaskRepeat === 'Once' ? {borderColor: '#2563eb', backgroundColor: '#eff6ff'} : {}}>
                          <input
                            type="radio"
                            name="repeat"
                            value="Once"
                            checked={newTaskRepeat === 'Once'}
                            onChange={(e) => setNewTaskRepeat(e.target.value)}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-slate-700">Once</span>
                        </label>
                        <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all" style={newTaskRepeat === 'Daily' ? {borderColor: '#2563eb', backgroundColor: '#eff6ff'} : {}}>
                          <input
                            type="radio"
                            name="repeat"
                            value="Daily"
                            checked={newTaskRepeat === 'Daily'}
                            onChange={(e) => setNewTaskRepeat(e.target.value)}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-slate-700">Daily</span>
                        </label>
                        <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all" style={newTaskRepeat === 'Monthly' ? {borderColor: '#2563eb', backgroundColor: '#eff6ff'} : {}}>
                          <input
                            type="radio"
                            name="repeat"
                            value="Monthly"
                            checked={newTaskRepeat === 'Monthly'}
                            onChange={(e) => setNewTaskRepeat(e.target.value)}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-slate-700">Monthly</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                {taskFormError && (
                  <p className="text-sm font-medium text-red-600">{taskFormError}</p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!availableTaskCategories.length}
                  >
                    Add to Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- GRID VIEW (ALL CLIENTS) ---
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

  return (
    <div className="p-4 space-y-8 animate-in fade-in duration-500 text-left bg-slate-100 min-h-full">
      <div className="flex justify-between items-center">
        <div className="relative w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" placeholder="Filter Clients..." className="w-full bg-white border border-slate-200 rounded-lg pl-12 pr-4 py-2.5 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 shadow-sm" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
        </div>
        {canAddClient && (
          <button onClick={() => setShowClientModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md">
            <Plus size={18}/> Add Client
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(c => {
          const counts = getTaskCounts(c.id);
          const staff = getProjectStaff(c.name);
          
          // Calculate average time spent per day
          const projectLogs = clientLogs[c.id] || [];
          const dailyTotals = {};
          projectLogs.forEach(log => {
            if (!dailyTotals[log.date]) {
              dailyTotals[log.date] = 0;
            }
            dailyTotals[log.date] += log.elapsedMs || 0;
          });
          const uniqueDays = Object.keys(dailyTotals).length || 1;
          const totalMs = Object.values(dailyTotals).reduce((sum, ms) => sum + ms, 0);
          const avgMs = totalMs / uniqueDays;
          const avgHours = Math.floor(avgMs / 3600000);
          const avgMinutes = Math.floor((avgMs % 3600000) / 60000);
          const avgTimeStr = avgHours > 0 ? `${avgHours}h ${avgMinutes}m` : `${avgMinutes}m`;
          
          return (
            <div
              key={c.id}
              onClick={() => setSelectedClient(c)}
              className="group bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer"
            >
              {/* Header with Account Name and Avg Time */}
              <div className="mb-5 flex items-start justify-between">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-all">{c.name}</h3>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 px-3 py-2 rounded-lg border border-purple-200 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-600 mb-0.5">Avg Daily</p>
                  <p className="text-sm font-bold text-purple-700">{avgTimeStr}</p>
                </div>
              </div>

              {/* Leadership Section */}
              {staff.admins.length > 0 && (
                <div className="mb-4 pb-4 border-b border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Leadership</p>
                  <div className="flex flex-wrap gap-2">
                    {staff.admins.map(admin => (
                      <div key={admin.id} className="flex items-center gap-1 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-300">
                        <Crown size={11} className="text-blue-600 fill-blue-600" />
                        <span className="text-xs font-semibold text-blue-700">{admin.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Section */}
              {staff.employees.length > 0 && (
                <div className="mb-5 pb-4 border-b border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Team</p>
                  <div className="flex flex-wrap gap-2">
                    {staff.employees.map(emp => (
                      <div key={emp.id} className="px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 shadow-sm">
                        <span className="text-xs font-semibold text-slate-600">{emp.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-orange-50 px-3 py-3 rounded-xl border border-orange-200 text-center">
                  <Clock size={16} className="text-orange-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-orange-600">{counts.open}</p>
                  <p className="text-[9px] text-orange-500 font-medium">Pending</p>
                </div>
                <div className="bg-blue-50 px-3 py-3 rounded-xl border border-blue-200 text-center">
                  <Activity size={16} className="text-blue-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-blue-600">{counts.wip}</p>
                  <p className="text-[9px] text-blue-500 font-medium">WIP</p>
                </div>
                <div className="bg-emerald-50 px-3 py-3 rounded-xl border border-emerald-200 text-center">
                  <CheckCircle size={16} className="text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-emerald-600">{counts.done}</p>
                  <p className="text-[9px] text-emerald-500 font-medium">Done</p>
                </div>
              </div>

              {/* View Tasks Button */}
              <button
                onClick={() => setSelectedClient(c)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-600 transition-all shadow-md group-hover:shadow-lg"
              >
                <Eye size={16} /> View Tasks
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-900/10 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-5xl p-6 border border-slate-200 shadow-xl rounded-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-slate-900">Add New Client</h4>
              <button onClick={() => setShowClientModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"><X size={18}/></button>
            </div>
            <form onSubmit={handleSaveClient} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Name</label>
                <input type="text" className="w-full p-3 border border-slate-200 bg-white rounded-lg text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all" placeholder="Enter company name" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[360px]">
                <div className="flex flex-col space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leadership</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="text" placeholder="Search admins" className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20" value={adminQuery} onChange={(e) => setAdminQuery(e.target.value)}/>
                  </div>
                  <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50/40 space-y-2">
                    {users.filter(u => managementRoles.includes(u.role) && u.name.toLowerCase().includes(adminQuery.toLowerCase())).map(admin => (
                      <button
                        key={admin.id}
                        type="button"
                        onClick={() => selectedAdmins.includes(admin.id)
                          ? setSelectedAdmins(selectedAdmins.filter(id => id !== admin.id))
                          : setSelectedAdmins([...selectedAdmins, admin.id])
                        }
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all border ${selectedAdmins.includes(admin.id)
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm font-semibold">{admin.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${selectedAdmins.includes(admin.id) ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                          {selectedAdmins.includes(admin.id) ? 'Selected' : 'Add'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Team</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="text" placeholder="Search team" className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20" value={teamQuery} onChange={(e) => setTeamQuery(e.target.value)}/>
                  </div>
                  <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50/40 space-y-2">
                    {users.filter(u => executionRoles.includes(u.role) && u.name.toLowerCase().includes(teamQuery.toLowerCase())).map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => selectedEmployees.includes(emp.id)
                          ? setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id))
                          : setSelectedEmployees([...selectedEmployees, emp.id])
                        }
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all border ${selectedEmployees.includes(emp.id)
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm font-semibold">{emp.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${selectedEmployees.includes(emp.id) ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                          {selectedEmployees.includes(emp.id) ? 'Selected' : 'Add'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm tracking-wide shadow-md hover:bg-blue-700 transition-all">Add Client</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientView;

// client side is view needed here 

// Add a timer view to add a task