import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users,
  Wallet,
  Shield,
  Receipt,
  LayoutDashboard,
  LineChart,
  TrendingUp,
  CreditCard,
  MessageSquare,
  X
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { getUnreadCount } = useChat();
  const unreadCount = getUnreadCount('admin');

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Users, label: 'Agents', path: '/agents' },
    { icon: LineChart, label: 'Accounts', path: '/accounts' },
    { icon: TrendingUp, label: 'Daily PnL', path: '/pnl' },
    { icon: Wallet, label: 'Divine Coins', path: '/wallets' },
    { icon: Receipt, label: 'Transactions', path: '/transactions' },
    { icon: MessageSquare, label: 'Chat', path: '/chat', badge: unreadCount },
    { icon: CreditCard, label: 'Manage Plans', path: '/manage-plans' },
    { icon: Shield, label: 'Team', path: '/staff' }
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
      } md:translate-x-0 transition-all duration-300 ease-in-out bg-background border-r border-border w-[280px] hover:w-[280px] md:w-[80px] md:hover:w-[280px] min-h-screen px-4 py-6 z-30 group`}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground ml-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">Admin Panel</span>
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
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? 'active'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
              <span className="flex-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;