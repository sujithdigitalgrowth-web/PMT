import React, { useEffect, useState } from 'react';

// 1. IMPORT MODULAR VIEWS & COMPONENTS
import HomeView from './PMT/HomeView';
import ClientView from './PMT/ClientView';
import UserView from './PMT/Userview';
import SettingsView from './PMT/SettingsView';
import EmployeeView from './PMT/EmployeeView'; 
import MasterDataView from './PMT/MasterDataView';
import UserMetricsView from './PMT/UserMetricsView';
import ReportsView from './PMT/ReportsView';
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
  const [clients, setClients] = useState([]);

  // Users with full hierarchy
  const [users, setUsers] = useState([
    { id: 1, name: "Theo", email: "theo@ethinos.com", role: 'Super Admin', assignedProjects: ["All"], department: 'Growth', region: 'North' },
    { id: 201, name: "Ankit", email: "ankit@ethinos.com", role: 'Director', assignedProjects: ["KMF", "Durian"], department: 'Growth', region: 'South' },
    { id: 202, name: "Poonam", email: "poonam@ethinos.com", role: 'Director', assignedProjects: ["Bajaj - Chetak", "Bajaj - KTM"], department: 'Client Servicing', region: 'West' },
    { id: 205, name: "Suresh", email: "suresh@ethinos.com", role: 'Director', assignedProjects: ["KMF", "Durian", "Bajaj - Chetak", "Bajaj - KTM"], department: 'Growth', region: 'North' },
    // Managers
    { id: 203, name: "Sanford", email: "sanford@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - Chetak"], department: 'Client Servicing', region: 'North' },
    { id: 204, name: "Yogesh", email: "yogesh@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - KTM"], department: 'Client Servicing', region: 'South' },
    { id: 206, name: "Abha", email: "abha@ethinos.com", role: 'Manager', assignedProjects: ["KMF"], department: 'Growth', region: 'North' },
    { id: 207, name: "Gaurav Sharma", email: "gaurav.sharma@ethinos.com", role: 'Manager', assignedProjects: ["Durian"], department: 'Growth', region: 'South' },
    { id: 208, name: "Manuj", email: "manuj@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - Chetak"], department: 'Growth', region: 'West' },
    { id: 209, name: "Rajesh", email: "rajesh@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - KTM"], department: 'Growth', region: 'North' },
    { id: 210, name: "Prashanth Raghavan", email: "prashanth.r@ethinos.com", role: 'Manager', assignedProjects: ["KMF", "Durian"], department: 'Growth', region: 'South' },
    { id: 211, name: "Chinthan", email: "chinthan@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - Chetak"], department: 'Growth', region: 'West' },
    { id: 212, name: "Shivananda", email: "shivananda@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - KTM"], department: 'Growth', region: 'North' },
    { id: 213, name: "Yash", email: "yash.manager@ethinos.com", role: 'Manager', assignedProjects: ["KMF"], department: 'Growth', region: 'South' },
    { id: 214, name: "Ritwick", email: "ritwick@ethinos.com", role: 'Manager', assignedProjects: ["Durian"], department: 'Growth', region: 'West' },
    { id: 215, name: "Yash Karnawat", email: "yash.karnawat@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - Chetak"], department: 'Growth', region: 'North' },
    { id: 216, name: "Pranali", email: "pranali@ethinos.com", role: 'Manager', assignedProjects: ["Bajaj - KTM"], department: 'Growth', region: 'South' },
    // Senior Executives / Assistant Managers
    { id: 301, name: "Saloni", email: "saloni@ethinos.com", role: 'Snr Executive', assignedProjects: ["KMF"], department: 'Creative', region: 'North' },
    { id: 302, name: "Tharun", email: "tharun@ethinos.com", role: 'Snr Executive', assignedProjects: ["Durian"], department: 'Growth', region: 'South' },
    { id: 303, name: "Riya Joshi", email: "riya.joshi@ethinos.com", role: 'Snr Executive', assignedProjects: ["Bajaj - Chetak"], department: 'Creative', region: 'West' },
    { id: 304, name: "Shuchi", email: "shuchi@ethinos.com", role: 'Snr Executive', assignedProjects: ["Bajaj - KTM"], department: 'Growth', region: 'North' },
    { id: 305, name: "Kristy", email: "kristy@ethinos.com", role: 'Snr Executive', assignedProjects: ["KMF"], department: 'Creative', region: 'South' },
    { id: 306, name: "Sujit", email: "sujit@ethinos.com", role: 'Snr Executive', assignedProjects: ["Durian"], department: 'Growth', region: 'West' },
    { id: 307, name: "Sonia", email: "sonia@ethinos.com", role: 'Snr Executive', assignedProjects: ["Bajaj - Chetak"], department: 'Growth', region: 'North' },
    // Executives
    { id: 401, name: "Harsh", email: "harsh@ethinos.com", role: 'Executive', assignedProjects: ["Durian"], department: 'Biddable', region: 'South' },
    { id: 402, name: "Manan Bhanushali", email: "manan.b@ethinos.com", role: 'Executive', assignedProjects: ["Bajaj - Chetak"], department: 'Growth', region: 'West' },
    { id: 403, name: "Tarang Mishra", email: "tarang.m@ethinos.com", role: 'Executive', assignedProjects: ["KMF"], department: 'Growth', region: 'North' },
    { id: 404, name: "Deboshree", email: "deboshree@ethinos.com", role: 'Executive', assignedProjects: ["Bajaj - KTM"], department: 'Growth', region: 'South' },
    { id: 405, name: "Mohit", email: "mohit@ethinos.com", role: 'Executive', assignedProjects: ["Durian"], department: 'Growth', region: 'West' },
    { id: 406, name: "Akshitha", email: "akshitha@ethinos.com", role: 'Executive', assignedProjects: ["Bajaj - Chetak"], department: 'Growth', region: 'North' },
    { id: 407, name: "Mayur", email: "mayur@ethinos.com", role: 'Executive', assignedProjects: ["Bajaj - KTM"], department: 'Growth', region: 'South' },
    { id: 408, name: "Pranoti", email: "pranoti@ethinos.com", role: 'Executive', assignedProjects: ["KMF"], department: 'Creative', region: 'West' },
    { id: 409, name: "Mahak Gupta", email: "mahak.g@ethinos.com", role: 'Executive', assignedProjects: ["Durian"], department: 'Growth', region: 'North' },
    { id: 410, name: "Angad", email: "angad@ethinos.com", role: 'Executive', assignedProjects: ["Bajaj - Chetak"], department: 'Growth', region: 'South' },
    { id: 411, name: "Aditya", email: "aditya@ethinos.com", role: 'Executive', assignedProjects: ["Bajaj - KTM"], department: 'Growth', region: 'West' },
    // Business Heads
    { id: 501, name: "Simran", email: "simran@ethinos.com", role: 'Business Head', assignedProjects: ["KMF", "Durian"], department: 'Growth', region: 'North' },
    { id: 502, name: "Souvik", email: "souvik@ethinos.com", role: 'Business Head', assignedProjects: ["Bajaj - Chetak", "Bajaj - KTM"], department: 'Growth', region: 'South' },
    { id: 503, name: "Pranav", email: "pranav@ethinos.com", role: 'Business Head', assignedProjects: ["KMF"], department: 'Growth', region: 'North' },
    { id: 504, name: "Kishan", email: "kishan@ethinos.com", role: 'Business Head', assignedProjects: ["Durian"], department: 'Growth', region: 'South' },
    { id: 505, name: "Abhay", email: "abhay@ethinos.com", role: 'Business Head', assignedProjects: ["Bajaj - Chetak"], department: 'Growth', region: 'West' },
    { id: 506, name: "Philip", email: "philip@ethinos.com", role: 'Business Head', assignedProjects: ["Bajaj - KTM"], department: 'Growth', region: 'North' },
    { id: 507, name: "Prashanth", email: "prashanth@ethinos.com", role: 'Business Head', assignedProjects: ["KMF", "Durian"], department: 'Growth', region: 'South' },
    { id: 508, name: "DJ", email: "dj@ethinos.com", role: 'Business Head', assignedProjects: ["Bajaj - Chetak", "Bajaj - KTM"], department: 'Growth', region: 'West' },
    // Senior Managers
    { id: 251, name: "Madhulika", email: "madhulika@ethinos.com", role: 'Snr Manager', assignedProjects: ["KMF", "Durian"], department: 'Growth', region: 'North' },
    { id: 252, name: "Haseeb", email: "haseeb@ethinos.com", role: 'Snr Manager', assignedProjects: ["Bajaj - Chetak", "Bajaj - KTM"], department: 'Growth', region: 'South' },
    { id: 253, name: "Vineeth", email: "vineeth@ethinos.com", role: 'Snr Manager', assignedProjects: ["KMF"], department: 'Client Servicing', region: 'West' },
    { id: 254, name: "Sana", email: "sana@ethinos.com", role: 'Snr Manager', assignedProjects: ["Durian", "Bajaj - Chetak"], department: 'Growth', region: 'North' }
  ]);

  const [taskCategories, setTaskCategories] = useState([
    'General',
    'Planning',
    'Execution',
    'Review',
    'Campaign Setup',
    'Execution - Campaign Creation',
    'Execution - Campaign Structuring',
    'Execution - Budget & Bidding Setup',
    'Platform Setup',
    'Execution - Google Ads Setup',
    'Execution - Meta Ads Setup',
    'Execution - Bing Ads Setup',
    'Targeting & Inputs',
    'Execution - Audience Setup',
    'Execution - Keyword Uploads',
    'Execution - Negative Keywords Setup',
    'Creatives & Assets',
    'Execution - Creative Uploads',
    'Execution - Ad Copy Implementation',
    'Execution - Extensions Setup (Sitelinks, Callouts, etc.)',
    'Tracking & QA',
    'Execution - Conversion Tracking Setup',
    'Execution - Pixel / GTM Implementation',
    'Execution - QA & Pre-Launch Checks',
    'Internal',
    'General - Internal Meetings',
    'General - Internal Training',
    'General - Team Coordination',
    'Client Communication',
    'General - Client Meetings',
    'General - Client Communication (Email / WhatsApp)',
    'General - Client Approvals',
    'Planning & Admin',
    'General - Task Planning',
    'General - Documentation',
    'General - Reporting Coordination',
    'Optimization - Budget Adjustments',
    'Optimization - Bid Adjustments',
    'Optimization - Audience Optimization',
    'Optimization - Creative Optimization',
    'Optimization - Keyword Optimization',
    'Optimization - Scaling / Pausing',
    'Tracking - Pixel Setup',
    'Tracking - Conversion Tracking',
    'Tracking - GTM / GA4 Setup',
    'Tracking - Event Validation',
    'Reporting - Daily Performance',
    'Reporting - Daily Spend & Pacing',
    'Reporting - Daily Conversions',
    'Reporting - Weekly Performance Summary',
    'Reporting - Weekly Insights',
    'Reporting - Weekly Action Plan',
    'Reporting - Monthly Performance',
    'Reporting - Monthly KPI vs Target',
    'Reporting - Monthly Insights & Strategy'
  ]);
  const [departments, setDepartments] = useState(['Creative', 'Biddable', 'Growth', 'Client Servicing']);
  const [regions, setRegions] = useState(['North', 'South', 'West']);
  const [controlCenterAccessRoles, setControlCenterAccessRoles] = useState(['Super Admin', 'Director']);
  const [settingsAccessRoles, setSettingsAccessRoles] = useState(['Super Admin', 'Director']);
  const [userManagementAccessRoles, setUserManagementAccessRoles] = useState(['Super Admin', 'Director']);
  const [employeeViewAccessRoles, setEmployeeViewAccessRoles] = useState(['Super Admin', 'Director']);
  const [metricsAccessRoles, setMetricsAccessRoles] = useState(['Super Admin', 'Director']);
  const [reportsAccessRoles, setReportsAccessRoles] = useState(['Super Admin', 'Director']);

  const [clientLogs, setClientLogs] = useState({});
  
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
  const canSeeReports = reportsAccessRoles.includes(currentUser?.role);
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
    reports: 'Reports',
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
    if (activeTab === 'reports' && !canSeeReports) {
      setActiveTab('home');
    }
  }, [activeTab, canSeeControlCenter, canSeeSettings, canSeeUserManagement, canSeeEmployeeView, canSeeMetrics, canSeeReports]);

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
        canSeeReports={canSeeReports}
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

          {activeTab === 'reports' && !selectedClient && canSeeReports && (
            <ReportsView users={users} clients={clients} clientLogs={clientLogs} />
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
              reportsAccessRoles={reportsAccessRoles}
              setReportsAccessRoles={setReportsAccessRoles}
            />
          )}

        </main>
      </div>
    </div>
  );
};

export default App;