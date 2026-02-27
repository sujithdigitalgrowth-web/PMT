import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SettingsView = ({ users = [], setUsers, currentUser, clients = [], setClients, setClientLogs }) => {
  const [settingsSearch, setSettingsSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [activeSection, setActiveSection] = useState('user-control');
  const [clientSearch, setClientSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
  const canManageClients = canEditRoles;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(settingsSearch.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredClients = clients.filter(client => {
    const query = clientSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      client.name.toLowerCase().includes(query) ||
      (client.industry || '').toLowerCase().includes(query)
    );
  });

  const selectedClient = clients.find(client => client.id === selectedClientId) || null;

  const isMemberSearchActive = memberSearch.trim().length > 0;

  const filteredMembers = users.filter(user => {
    if (!selectedClient) return false;
    const query = memberSearch.trim().toLowerCase();
    const isAssigned = (user.assignedProjects || []).includes(selectedClient.name);
    if (!query) return isAssigned;
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  const toggleMemberForClient = (memberId) => {
    if (!canManageClients || !selectedClient) return;
    setUsers((prevUsers) => prevUsers.map((member) => {
      if (member.id !== memberId) return member;
      const assignments = member.assignedProjects || [];
      const isAssigned = assignments.includes(selectedClient.name);
      if (isAssigned) {
        return {
          ...member,
          assignedProjects: assignments.filter(project => project !== selectedClient.name)
        };
      }
      return {
        ...member,
        assignedProjects: [...assignments, selectedClient.name]
      };
    }));
  };

  const deleteSelectedClient = () => {
    if (!canManageClients || !selectedClient) return;

    setClients((prevClients) => prevClients.filter(client => client.id !== selectedClient.id));
    setUsers((prevUsers) => prevUsers.map((member) => ({
      ...member,
      assignedProjects: (member.assignedProjects || []).filter(project => project !== selectedClient.name)
    })));
    setClientLogs((prevLogs) => {
      const nextLogs = { ...prevLogs };
      delete nextLogs[selectedClient.id];
      return nextLogs;
    });
    setShowDeleteConfirm(false);
    setSelectedClientId(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 font-sans text-left p-2">
      <div className="flex justify-between items-center mb-3 gap-4">
        <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveSection('user-control')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border ${activeSection === 'user-control' ? 'bg-white text-slate-900 border-slate-900' : 'bg-white text-slate-700 border-transparent hover:border-slate-300'}`}
          >
            User Status Control
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('client-control')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border ${activeSection === 'client-control' ? 'bg-white text-slate-900 border-slate-900' : 'bg-white text-slate-700 border-transparent hover:border-slate-300'}`}
          >
            Client Control View
          </button>
        </div>
      </div>

      {activeSection === 'user-control' && (
      <>
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
      </>
      )}

      {activeSection === 'client-control' && (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="border border-slate-200 rounded-2xl bg-white shadow-sm p-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Client Control View</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Assign people to clients or remove a client fully.</p>
            </div>
            <div className="relative w-64">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-12 pr-4 py-2 text-sm outline-none focus:border-green-500 font-medium"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">Clients</div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredClients.map(client => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-all ${selectedClientId === client.id ? 'bg-slate-100' : 'bg-white'}`}
                  >
                    <div className="text-sm font-semibold text-slate-900">{client.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{client.industry || 'General'}</div>
                  </button>
                ))}
                {!filteredClients.length && (
                  <div className="px-4 py-6 text-xs font-medium text-slate-500">No clients found.</div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{selectedClient ? selectedClient.name : 'Select a client'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{selectedClient ? 'Manage assignments and delete client' : 'Pick a client from the left list'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!selectedClient || !canManageClients}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${selectedClient && canManageClients ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                >
                  Delete Client
                </button>
              </div>

              <div className="p-4 border-b border-slate-200">
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input
                    type="text"
                    placeholder="Search and add team members..."
                    className="w-full bg-white border border-slate-200 rounded-lg pl-12 pr-4 py-2 text-sm outline-none focus:border-green-500 font-medium"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    disabled={!selectedClient}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredMembers.map(member => {
                  const isAssigned = selectedClient ? (member.assignedProjects || []).includes(selectedClient.name) : false;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      disabled={!selectedClient || !canManageClients}
                      onClick={() => toggleMemberForClient(member.id)}
                      className={`w-full text-left px-4 py-3 transition-all flex items-center justify-between gap-3 ${!selectedClient || !canManageClients ? 'bg-white cursor-not-allowed opacity-70' : 'hover:bg-slate-50'} ${isAssigned ? 'bg-emerald-50' : 'bg-white'}`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                        <div className="text-xs text-slate-500">{member.role} • {member.email}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isAssigned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {isAssigned ? 'Assigned' : 'Tap to Add'}
                      </span>
                    </button>
                  );
                })}
                {!!selectedClient && !filteredMembers.length && (
                  <div className="px-4 py-6 text-xs font-medium text-slate-500">
                    {isMemberSearchActive ? 'No matching members found.' : 'No members assigned yet. Search to add members.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-5">
            <h4 className="text-base font-bold text-slate-900">Delete Client</h4>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{selectedClient.name}</span>? This will remove it from all assigned users.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteSelectedClient}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;