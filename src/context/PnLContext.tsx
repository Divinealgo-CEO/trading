import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PnLEntry {
  id: number;
  userId: string;
  date: string;
  symbol: string;
  totalPnL: number;
  customerShare: number;
  divineAlgoShare: number;
}

interface PnLContextType {
  pnlData: PnLEntry[];
  setPnlData: React.Dispatch<React.SetStateAction<PnLEntry[]>>;
  totalDivineAlgoShare: number;
}

const PnLContext = createContext<PnLContextType | undefined>(undefined);

const STORAGE_KEY = 'divine_algo_pnl';

const generatePnLData = () => {
  const data: PnLEntry[] = [];
  const userIds = ['T1234', 'A5678', 'B9012'];
  const startDate = new Date('2025-01-10');
  const endDate = new Date('2025-02-11');
  let currentDate = startDate;
  let id = 1;

  while (currentDate <= endDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      userIds.forEach(userId => {
        // Generate random PnL between 20 and 200
        const totalPnL = Math.floor(Math.random() * (200 - 20 + 1)) + 20;
        const customerShare = totalPnL * 0.4; // 40% to customer
        const divineAlgoShare = totalPnL * 0.6; // 60% to divine algo

        data.push({
          id: id++,
          userId,
          date: currentDate.toISOString().split('T')[0],
          symbol: 'EURUSDc',
          totalPnL,
          customerShare,
          divineAlgoShare
        });
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

const fixedPnLData = generatePnLData();

export function PnLProvider({ children }: { children: ReactNode }) {
  const [pnlData, setPnlData] = useState<PnLEntry[]>(() => {
    const storedPnL = localStorage.getItem(STORAGE_KEY);
    return storedPnL ? JSON.parse(storedPnL) : fixedPnLData;
  });

  const totalDivineAlgoShare = pnlData.reduce((sum, entry) => sum + entry.divineAlgoShare, 0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pnlData));
  }, [pnlData]);

  return (
    <PnLContext.Provider value={{ pnlData, setPnlData, totalDivineAlgoShare }}>
      {children}
    </PnLContext.Provider>
  );
}

export function usePnL() {
  const context = useContext(PnLContext);
  if (context === undefined) {
    throw new Error('usePnL must be used within a PnLProvider');
  }
  return context;
}