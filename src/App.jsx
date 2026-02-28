import React, { useEffect, useState } from 'react';

// 1. IMPORT MODULAR VIEWS & COMPONENTS
import HomeView from './PMT/HomeView';
import ClientView from './PMT/ClientView';
import UserView from './PMT/Userview';
import SettingsView from './PMT/SettingsView';
import EmployeeView from './PMT/EmployeeView'; 
import MasterDataView from './PMT/MasterDataView';
import UserMetricsView from './PMT/UserMetricsView';
import Sidebar from './PMT/Sidebar';
import Notifications from './PMT/Notifications';
import ProfileDropdown from './PMT/ProfileDropdown';
import LoginView from './PMT/LoginView';

const App = () => {
  const TEST_LOGIN_EMAIL = 'test@ethinos.com';
  const TEST_LOGIN_PASSWORD = 'ethinos@2026';

  // 2. DATA STATES (The Source of Truth)
  const [activeTab, setActiveTab] = useState('home'); 
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loginError, setLoginError] = useState('');
  
  // Clients
  const [clients, setClients] = useState([
    { id: 'kmf-01', name: "KMF", industry: "Dairy" },
    { id: 'durian-02', name: "Durian", industry: "Furniture" },
    { id: 'chetak-03', name: "Bajaj - Chetak", industry: "Automotive" },
    { id: 'ktm-04', name: "Bajaj - KTM", industry: "Automotive" }
  ]);

  // Users with full hierarchy
  const [users, setUsers] = useState([
    { id: 1, name: "Theo", email: "theo@ethinos.com", role: 'Super Admin', assignedProjects: ["All"], department: 'Growth', region: 'North' },
    { id: 201, name: "Ankit", email: "ankit@ethinos.com", role: 'Director', assignedProjects: ["KMF", "Durian"], department: 'Growth', region: 'South' },
    { id: 202, name: "Poonam", email: "poonam@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - Chetak", "Bajaj - KTM"], department: 'Client Servicing', region: 'West' },
    { id: 203, name: "Sanford", email: "sanford@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - Chetak"], department: 'Client Servicing', region: 'North' },
    { id: 204, name: "Yogesh", email: "yogesh@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - KTM"], department: 'Client Servicing', region: 'South' },
    { id: 301, name: "Saloni", email: "saloni@ethinos.com", role: 'Snr Executive', assignedProjects: ["KMF"], department: 'Creative', region: 'North' },
    { id: 302, name: "Harsh", email: "harsh@ethinos.com", role: 'Executive', assignedProjects: ["Durian"], department: 'Biddable', region: 'South' },
    { id: 303, name: "Riya", email: "riya@ethinos.com", role: 'Intern', assignedProjects: ["Bajaj - Chetak"], department: 'Biddable', region: 'West' },
    { id: 304, name: "Pranoti", email: "pranoti@ethinos.com", role: 'Intern', assignedProjects: ["Bajaj - Chetak"], department: 'Creative', region: 'West' },
    { id: 305, name: "Yash", email: "yash@ethinos.com", role: 'Intern', assignedProjects: ["Bajaj - KTM"], department: 'Biddable', region: 'South' },
    { id: 306, name: "Mayur", email: "mayur@ethinos.com", role: 'Intern', assignedProjects: ["Bajaj - KTM"], department: 'Growth', region: 'North' }
  ]);

  const [taskCategories, setTaskCategories] = useState(['General', 'Planning', 'Execution', 'Review']);
  const [departments, setDepartments] = useState(['Creative', 'Biddable', 'Growth', 'Client Servicing']);
  const [regions, setRegions] = useState(['North', 'South', 'West']);
  const [controlCenterAccessRoles, setControlCenterAccessRoles] = useState(['Super Admin', 'Director']);
  const [settingsAccessRoles, setSettingsAccessRoles] = useState(['Super Admin', 'Director']);
  const [userManagementAccessRoles, setUserManagementAccessRoles] = useState(['Super Admin', 'Director']);
  const [employeeViewAccessRoles, setEmployeeViewAccessRoles] = useState(['Super Admin', 'Director']);
  const [metricsAccessRoles, setMetricsAccessRoles] = useState(['Super Admin', 'Director']);

  const [clientLogs, setClientLogs] = useState({ 
    'kmf-01': [{ id: 'l1', date: '27th Feb 2026', comment: 'Initial Setup', result: '', status: 'Pending' }] 
  });
  
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Permissions system active", time: "Just now", read: false },
  ]);
  const [, setUserPasswords] = useState({});

  // 3. GLOBAL UI STATES
  const [selectedClient, setSelectedClient] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [settingsSearch, setSettingsSearch] = useState("");
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  // 4. SHARED LOGIC
  const currentUser = users.find(u => u.id === currentUserId) || null;
  const canSeeControlCenter = controlCenterAccessRoles.includes(currentUser?.role);
  const canSeeSettings = settingsAccessRoles.includes(currentUser?.role);
  const canSeeUserManagement = userManagementAccessRoles.includes(currentUser?.role);
  const canSeeEmployeeView = employeeViewAccessRoles.includes(currentUser?.role);
  const canSeeMetrics = metricsAccessRoles.includes(currentUser?.role);
  const availableRoles = [...new Set(users.map(user => user.role))];
  
  const accessibleClients = !currentUser
    ? []
    : currentUser.role === 'Super Admin'
      ? clients
      : clients.filter(c => currentUser.assignedProjects.includes(c.name));
  const allTasks = accessibleClients.flatMap(c => (clientLogs[c.id] || []).map(t => ({ ...t, cid: c.id, cName: c.name })));
  const tabTitles = {
    home: 'Home',
    clients: 'Clients',
    users: 'Users',
    metrics: 'Metrics',
    employees: 'Employees',
    settings: 'Settings',
    'master-data': 'Control Center'
  };
  
  const isMinimized = sidebarMinimized || activeTab === 'clients' || selectedClient !== null;

  const handleUpdateProfileName = (updatedName) => {
    if (!updatedName?.trim() || !currentUser) return;
    setUsers(prevUsers => prevUsers.map(user =>
      user.id === currentUser.id ? { ...user, name: updatedName.trim() } : user
    ));
  };

  const handleChangePassword = (nextPassword) => {
    if (!nextPassword || !currentUser) return;
    setUserPasswords(prev => ({
      ...prev,
      [currentUser.id]: nextPassword
    }));
  };

  const handleLogin = (email, password) => {
    if (!email || !password) {
      setLoginError('Enter both email and password');
      return;
    }

    const isValidTestLogin =
      email.toLowerCase() === TEST_LOGIN_EMAIL.toLowerCase() &&
      password === TEST_LOGIN_PASSWORD;

    if (!isValidTestLogin) {
      setLoginError('Invalid login credentials');
      return;
    }

    setCurrentUserId(1);
    setLoginError('');
    setIsProfileOpen(false);
    setIsNotifOpen(false);
    setSelectedClient(null);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsNotifOpen(false);
    setSelectedClient(null);
    setActiveTab('home');
    setCurrentUserId(null);
    setLoginError('');
  };

  useEffect(() => {
    if (activeTab === 'master-data' && !canSeeControlCenter) {
      setActiveTab('home');
    }
    if (activeTab === 'settings' && !canSeeSettings) {
      setActiveTab('home');
    }
    if (activeTab === 'users' && !canSeeUserManagement) {
      setActiveTab('home');
    }
    if (activeTab === 'employees' && !canSeeEmployeeView) {
      setActiveTab('home');
    }
    if (activeTab === 'metrics' && !canSeeMetrics) {
      setActiveTab('home');
    }
  }, [activeTab, canSeeControlCenter, canSeeSettings, canSeeUserManagement, canSeeEmployeeView, canSeeMetrics]);

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} loginError={loginError} />;
  }

  return (
    <div
      className="flex w-screen h-screen text-black text-sm overflow-hidden font-sans"
      style={{
        background:
          'radial-gradient(58% 64% at 8% 10%, rgba(241, 94, 88, 0.14) 0%, rgba(241, 94, 88, 0) 62%), radial-gradient(48% 56% at 52% 92%, rgba(82, 110, 255, 0.13) 0%, rgba(82, 110, 255, 0) 64%), radial-gradient(36% 48% at 96% 12%, rgba(236, 232, 123, 0.15) 0%, rgba(236, 232, 123, 0) 62%), linear-gradient(140deg, #fff7f8 0%, #f7f8ff 58%, #fffde9 100%)'
      }}
    >
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setSelectedClient={setSelectedClient} 
        isMinimized={isMinimized}
        setIsMinimized={setSidebarMinimized}
        canSeeControlCenter={canSeeControlCenter}
        canSeeSettings={canSeeSettings}
        canSeeUserManagement={canSeeUserManagement}
        canSeeEmployeeView={canSeeEmployeeView}
        canSeeMetrics={canSeeMetrics}
      />

      <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative border-l border-white/40">
        
        <header className="h-16 px-8 flex items-center justify-between border-b border-white/50 font-black bg-white/45 backdrop-blur-sm uppercase sticky top-0 z-20">
          <h2 className="tracking-tight text-black">{selectedClient ? selectedClient.name : (tabTitles[activeTab] || activeTab)}</h2>
          <div className="flex items-center gap-4">
            <Notifications
              isNotifOpen={isNotifOpen}
              setIsNotifOpen={setIsNotifOpen}
              setIsProfileOpen={setIsProfileOpen}
              notifications={notifications}
              currentUser={currentUser}
              users={users}
              clients={clients}
              clientLogs={clientLogs}
            />
            <ProfileDropdown
              isProfileOpen={isProfileOpen}
              setIsProfileOpen={setIsProfileOpen}
              setIsNotifOpen={setIsNotifOpen}
              currentUser={currentUser}
              onUpdateProfileName={handleUpdateProfileName}
              onChangePassword={handleChangePassword}
              onLogout={handleLogout}
            />
          </div>
        </header>

        <main className="p-6 overflow-y-auto flex-1 bg-transparent">
          
          {activeTab === 'home' && !selectedClient && (
            <HomeView
              accessibleClients={accessibleClients}
              allTasks={allTasks}
              clientLogs={clientLogs}
              setSelectedClient={setSelectedClient}
              setClientLogs={setClientLogs}
              currentUser={currentUser}
              taskCategories={taskCategories}
            />
          )}

          {(activeTab === 'clients' || selectedClient) && (
            <ClientView 
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              clients={clients}
              setClients={setClients}
              clientLogs={clientLogs}
              setClientLogs={setClientLogs}
              clientSearch={clientSearch}
              setClientSearch={setClientSearch}
              currentUser={currentUser} 
              users={users}
              setUsers={setUsers} 
              taskCategories={taskCategories}
              setNotifications={setNotifications}
            />
          )}

          {activeTab === 'employees' && !selectedClient && canSeeEmployeeView && (
            <EmployeeView users={users} regions={regions} clients={clients} clientLogs={clientLogs} />
          )}

          {activeTab === 'users' && !selectedClient && canSeeUserManagement && (
            <UserView 
              users={users} 
              setUsers={setUsers} 
              clients={clients} 
              currentUser={currentUser} 
              settingsSearch={settingsSearch}
              setSettingsSearch={setSettingsSearch}
              departments={departments}
              regions={regions}
            />
          )}

          {activeTab === 'metrics' && !selectedClient && canSeeMetrics && (
            <UserMetricsView users={users} clients={clients} clientLogs={clientLogs} />
          )}

          {/* FIXED: SettingsView now receives currentUser to unlock role editing */}
          {activeTab === 'settings' && !selectedClient && canSeeSettings && (
            <SettingsView 
              users={users} 
              setUsers={setUsers} 
              currentUser={currentUser}
              clients={clients}
              setClients={setClients}
              setClientLogs={setClientLogs}
            />
          )}

          {activeTab === 'master-data' && !selectedClient && canSeeControlCenter && (
            <MasterDataView
              taskCategories={taskCategories}
              setTaskCategories={setTaskCategories}
              departments={departments}
              setDepartments={setDepartments}
              regions={regions}
              setRegions={setRegions}
              availableRoles={availableRoles}
              controlCenterAccessRoles={controlCenterAccessRoles}
              setControlCenterAccessRoles={setControlCenterAccessRoles}
              settingsAccessRoles={settingsAccessRoles}
              setSettingsAccessRoles={setSettingsAccessRoles}
              userManagementAccessRoles={userManagementAccessRoles}
              setUserManagementAccessRoles={setUserManagementAccessRoles}
              employeeViewAccessRoles={employeeViewAccessRoles}
              setEmployeeViewAccessRoles={setEmployeeViewAccessRoles}
              metricsAccessRoles={metricsAccessRoles}
              setMetricsAccessRoles={setMetricsAccessRoles}
            />
          )}

        </main>
      </div>
    </div>
  );
};

export default App;