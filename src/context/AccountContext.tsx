import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Account {
  id: number;
  userId: string;
  account_no: string;
  server: string;
  password: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface AccountContextType {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  totalAccounts: number;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const STORAGE_KEY = 'divine_algo_accounts';

// Generate random accounts
const generateRandomAccounts = () => {
  const servers = ['MT4-Live', 'MT5-Demo', 'MT4-Demo', 'MT5-Live'];
  const statuses: ('Pending' | 'Approved' | 'Rejected')[] = ['Pending', 'Approved', 'Rejected'];
  
  // Generate unique user IDs
  const generateUserId = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const numbers = Math.floor(1000 + Math.random() * 9000);
    return `${letter}${numbers}`;
  };

  // Generate unique account number
  const generateAccountNo = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };
  
  // Generate accounts with unique IDs
  return Array.from({ length: 25 }, (_, index) => {
    const uniqueId = Date.now() + index; // Ensure unique ID by using timestamp + index
    return {
      id: uniqueId,
      userId: generateUserId(),
      account_no: generateAccountNo(),
      server: servers[Math.floor(Math.random() * servers.length)],
      password: Math.random().toString(36).slice(-8),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  });
};

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const storedAccounts = localStorage.getItem(STORAGE_KEY);
    if (storedAccounts) {
      return JSON.parse(storedAccounts);
    }

    // Create initial accounts with unique IDs
    const timestamp = Date.now();
    const initialAccounts = [
      {
        id: timestamp,
        userId: 'T1234',
        account_no: '12345678',
        server: 'MT4-Live',
        password: 'test123',
        status: 'Approved' as const
      },
      {
        id: timestamp + 1,
        userId: 'T1234',
        account_no: '87654321',
        server: 'MT4-Live',
        password: 'test123',
        status: 'Approved' as const
      },
      ...generateRandomAccounts()
    ];

    return initialAccounts;
  });

  const totalAccounts = accounts.length;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  return (
    <AccountContext.Provider value={{ accounts, setAccounts, totalAccounts }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}