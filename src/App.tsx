import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PnLProvider } from './context/PnLContext';
import { AccountProvider } from './context/AccountContext';
import { UserProvider } from './context/UserContext';
import { PlanProvider } from './context/PlanContext';
import { WalletProvider } from './context/WalletContext';
import { ChatProvider } from './context/ChatContext';
import { TeamProvider } from './context/StaffContext';
import { ReferralProvider } from './context/ReferralContext';
import Sidebar from './components/Sidebar';
import CustomerSidebar from './components/CustomerSidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Accounts from './pages/Accounts';
import PnL from './pages/PnL';
import Wallets from './pages/Wallets';
import Transactions from './pages/Transactions';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerAccounts from './pages/customer/CustomerAccounts';
import CustomerPnL from './pages/customer/CustomerPnL';
import Plans from './pages/customer/Plans';
import AgentProgram from './pages/customer/AgentProgram';
import CustomerWallet from './pages/customer/CustomerWallet';
import Chat from './pages/Chat';
import CustomerChat from './pages/customer/CustomerChat';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AuthGuard from './components/AuthGuard';
import ManagePlans from './pages/ManagePlans';
import Agents from './pages/Agents';
import Profile from './pages/Profile';
import Staff from './pages/Staff';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768; // Default to open on desktop
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <UserProvider>
      <PlanProvider>
        <PnLProvider>
          <AccountProvider>
            <WalletProvider>
              <ChatProvider>
                <TeamProvider>
                  <AuthProvider>
                    <ReferralProvider>
                    <Router>
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        
                        {/* Protected Routes */}
                        <Route
                          path="/"
                          element={
                          <AuthGuard allowedRoles={['admin']}>
                            <div className="flex h-screen bg-background relative">
                              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                              <div className="flex-1 flex flex-col">
                                <Header onMenuClick={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6">
                                  <Outlet />
                                </main>
                              </div>
                            </div>
                          </AuthGuard>
                        }>
                          <Route index element={<Dashboard />} />
                          <Route path="users" element={<Users />} />
                          <Route path="accounts" element={<Accounts />} />
                          <Route path="pnl" element={<PnL />} />
                          <Route path="wallets" element={<Wallets />} />
                          <Route path="transactions" element={<Transactions />} />
                          <Route path="chat" element={<Chat />} />
                          <Route path="agents" element={<Agents />} />
                          <Route path="manage-plans" element={<ManagePlans />} />
                          <Route path="staff" element={<Staff />} />
                          <Route path="profile" element={<Profile />} />
                        </Route>

                        {/* Customer Routes */}
                        <Route
                          path="/customer"
                          element={
                          <AuthGuard allowedRoles={['customer']}>
                            <div className="flex h-screen bg-background relative">
                              <CustomerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                              <div className="flex-1 flex flex-col">
                                <Header onMenuClick={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6">
                                  <Outlet />
                                </main>
                              </div>
                            </div>
                          </AuthGuard>
                        }>
                          <Route index element={<CustomerDashboard />} />
                          <Route path="accounts" element={<CustomerAccounts />} />
                          <Route path="pnl" element={<CustomerPnL />} />
                          <Route path="plans" element={<Plans />} />
                          <Route path="agent-program" element={<AgentProgram />} />
                          <Route path="wallet" element={<CustomerWallet />} />
                          <Route path="chat" element={<CustomerChat />} />
                          <Route path="profile" element={<Profile />} />
                        </Route>
                      </Routes>
                    </Router>
                    </ReferralProvider>
                  </AuthProvider>
                </TeamProvider>
              </ChatProvider>
            </WalletProvider>
          </AccountProvider>
        </PnLProvider>
      </PlanProvider>
    </UserProvider>
  );
}

export default App;