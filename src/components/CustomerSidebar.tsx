import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  TrendingUp,
  CreditCard,
  Wallet,
  Users,
  MessageSquare,
  X
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

interface CustomerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomerSidebar = ({ isOpen, onClose }: CustomerSidebarProps) => {
  const { getUnreadCount } = useChat();
  const { user } = useAuth();
  const unreadCount = user ? getUnreadCount(user.id) : 0;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/customer' },
    { icon: LineChart, label: 'Accounts', path: '/customer/accounts' },
    { icon: TrendingUp, label: 'Daily PnL', path: '/customer/pnl' },
    { icon: Users, label: 'Agent Program', path: '/customer/agent-program' },
    { icon: Wallet, label: 'Divine Coins', path: '/customer/wallet' },
    { icon: MessageSquare, label: 'Chat', path: '/customer/chat', badge: unreadCount },
    { icon: CreditCard, label: 'Plans', path: '/customer/plans' }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-200 ease-in-out bg-background border-r border-border w-64 min-h-screen px-4 py-6 z-30`}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground ml-3">
              Customer Portal
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary md:hidden"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <nav>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) => `
                flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-200 ease-in-out
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-primary/10'
                }
              `
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="flex-1">
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 md:hidden">
          <div className="flex justify-around">
            {menuItems.slice(0, 4).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `p-2 rounded-lg flex flex-col items-center ${
                    isActive
                      ? 'text-primary font-medium'
                      : 'text-foreground hover:text-primary'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerSidebar;