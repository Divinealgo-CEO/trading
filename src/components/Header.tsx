import React from 'react';
import { Bell, Search, User as UserIcon, LogOut, Menu, ChevronDown, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userProfile = user?.user_metadata;
  const userName = userProfile?.name;
  const uniqueId = userProfile?.uniqueId;
  const userEmail = user?.email;
  const userPhone = userProfile?.phone || 'Not set';
  const userPhoneCode = userProfile?.phone_code || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className="bg-background/50 backdrop-blur-sm border-b border-border px-4 md:px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="mr-4 p-2 rounded-lg hover:bg-secondary md:hidden"
          >
            <Menu className="h-6 w-6 text-muted-foreground" />
          </button>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search..."
              className="input-field pl-10 hidden md:block"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground hidden md:block" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-secondary hidden lg:block">
            <Bell className="h-6 w-6 text-muted-foreground" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    Hey! {userName || 'there'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {uniqueId}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-popover text-popover-foreground rounded-lg shadow-lg py-1 z-50 border border-border">
                  <div className="px-4 py-2 border-b">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{userName}</p>
                        <p className="text-xs font-mono text-muted-foreground">ID: {uniqueId}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex items-center text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        {userEmail}
                      </div>
                      <div className="flex items-center text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        {userPhoneCode} {userPhone}
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-1">
                    <button
                      onClick={() => navigate(user?.user_metadata?.role === 'admin' ? '/profile' : '/customer/profile')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                  <div className="border-t mt-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;