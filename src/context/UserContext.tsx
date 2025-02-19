import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: number;
  uniqueId: string;
  username: string;
  email: string;
  phoneCode: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

interface UserContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  totalUsers: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Generate a unique ID with one letter and 4 numbers
const generateUniqueId = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `${letter}${numbers}`;
};

// Generate 30 random users
const generateRandomUsers = () => {
  const names = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'James', 'Emily'];
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const phoneCodes = ['+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+51', '+52', '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62', '+63', '+64', '+65', '+66', '+81', '+82', '+84', '+86', '+90', '+91', '+92', '+93', '+94', '+95', '+98'];
  
  // Create a Set to track used IDs
  const usedIds = new Set<number>();
  
  // Function to generate a unique ID
  const generateUniqueId = () => {
    let id = Math.floor(Math.random() * 1000000) + 1;
    while (usedIds.has(id)) {
      id = Math.floor(Math.random() * 1000000) + 1;
    }
    usedIds.add(id);
    return id;
  };
  
  return Array.from({ length: 30 }, (_, i) => ({
    id: generateUniqueId(),
    uniqueId: generateUniqueId(),
    username: `${names[Math.floor(Math.random() * names.length)]}${Math.floor(Math.random() * 1000)}`,
    email: `user${Math.floor(Math.random() * 10000)}@${domains[Math.floor(Math.random() * domains.length)]}`,
    phoneCode: phoneCodes[Math.floor(Math.random() * phoneCodes.length)],
    phone: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    status: Math.random() > 0.3 ? 'Active' as const : 'Inactive' as const,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
  }));
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => [
    {
      id: 1,
      uniqueId: 'T1234',
      username: 'TestCustomer',
      email: 'test@example.com',
      phoneCode: '+1',
      phone: '1234567890',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    ...generateRandomUsers()
  ]);
  const totalUsers = users.length;

  return (
    <UserContext.Provider value={{ users, setUsers, totalUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
}