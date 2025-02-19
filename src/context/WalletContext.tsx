import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Wallet } from '../types';

interface ArchivedWallet extends Wallet {
  archived_at: string;
}

interface WalletContextType {
  wallets: Wallet[];
  setWallets: React.Dispatch<React.SetStateAction<Wallet[]>>;
  archivedWallets: ArchivedWallet[];
  setArchivedWallets: React.Dispatch<React.SetStateAction<ArchivedWallet[]>>;
  totalWalletValue: number;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WALLETS: 'divine_algo_wallets',
  ARCHIVED: 'divine_algo_archived_wallets'
};

// Generate some initial wallets
const generateInitialWallets = () => [
  { wallet_id: 1, userId: 'T1234', balance: 1000, created_at: '2024-03-15', updated_at: '2024-03-15' },
  { wallet_id: 2, userId: 'A1234', balance: 500, created_at: '2024-03-15', updated_at: '2024-03-15' },
  { wallet_id: 3, userId: 'B5678', balance: 1200, created_at: '2024-03-14', updated_at: '2024-03-15' },
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const storedWallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
    return storedWallets ? JSON.parse(storedWallets) : generateInitialWallets();
  });
  const [archivedWallets, setArchivedWallets] = useState<ArchivedWallet[]>(() => {
    const storedArchived = localStorage.getItem(STORAGE_KEYS.ARCHIVED);
    return storedArchived ? JSON.parse(storedArchived) : [];
  });
  const totalWalletValue = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARCHIVED, JSON.stringify(archivedWallets));
  }, [archivedWallets]);
  return (
    <WalletContext.Provider value={{ 
      wallets, 
      setWallets, 
      archivedWallets, 
      setArchivedWallets, 
      totalWalletValue 
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallets() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallets must be used within a WalletProvider');
  }
  return context;
}