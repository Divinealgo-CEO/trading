import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface ModulePermissions {
  users: Permission;
  accounts: Permission;
  pnl: Permission;
  wallets: Permission;
  transactions: Permission;
  chat: Permission;
  agents: Permission;
  plans: Permission;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'support' | 'Chief Operating Officer (COO)' | 'Chief Technology Officer (CTO)' | 'Chief Marketing Officer (CMO)' | 'Chief Advising Officer (CAO)';
  status: 'Active' | 'Inactive';
  permissions: ModulePermissions;
  createdAt: string;
  lastLogin?: string;
}

interface TeamContextType {
  team: TeamMember[];
  setTeam: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  updateTeamMemberPermissions: (memberId: string, permissions: ModulePermissions) => void;
  getTeamMemberPermissions: (memberId: string) => ModulePermissions | null;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const defaultPermissions: ModulePermissions = {
  users: { view: true, edit: false, delete: false },
  accounts: { view: true, edit: true, delete: false },
  pnl: { view: true, edit: false, delete: false },
  wallets: { view: true, edit: false, delete: false },
  transactions: { view: true, edit: false, delete: false },
  chat: { view: true, edit: true, delete: true },
  agents: { view: true, edit: false, delete: false },
  plans: { view: true, edit: false, delete: false },
};

const initialTeam: TeamMember[] = [
  {
    id: `D${String(Math.floor(100 + Math.random() * 900))}`,
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'Chief Operating Officer (COO)',
    status: 'Active',
    permissions: defaultPermissions,
    createdAt: '2024-03-15T10:00:00Z',
    lastLogin: '2024-03-15T15:30:00Z'
  }
];

export function TeamProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);

  const updateTeamMemberPermissions = (memberId: string, permissions: ModulePermissions) => {
    setTeam(prev => prev.map(member => 
      member.id === memberId ? { ...member, permissions } : member
    ));
  };

  const getTeamMemberPermissions = (memberId: string): ModulePermissions | null => {
    const member = team.find(m => m.id === memberId);
    return member ? member.permissions : null;
  };

  return (
    <TeamContext.Provider value={{ 
      team, 
      setTeam,
      updateTeamMemberPermissions,
      getTeamMemberPermissions
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}