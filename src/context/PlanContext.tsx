import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Plan {
  name: 'Silver' | 'Gold' | 'Platinum';
  minDeposit: number;
  maxDeposit: number;
  maxAccounts: number;
  profitSharing: {
    customer: number;
    platform: number;
  };
  upfrontFee: number;
}

interface UserPlan {
  id: number; // Add unique ID field
  userId: string;
  plan: Plan['name'];
  status: 'Active' | 'Inactive';
  startDate: string;
}

interface PlanContextType {
  plans: Plan[];
  userPlans: UserPlan[];
  setUserPlans: React.Dispatch<React.SetStateAction<UserPlan[]>>;
  getUserPlan: (userId: string) => UserPlan | undefined;
}

const defaultPlans: Plan[] = [
  {
    name: 'Silver',
    minDeposit: 250,
    maxDeposit: 500,
    maxAccounts: 2,
    profitSharing: { customer: 40, platform: 60 },
    upfrontFee: 50,
  },
  {
    name: 'Gold',
    minDeposit: 250,
    maxDeposit: 1000,
    maxAccounts: 4,
    profitSharing: { customer: 50, platform: 50 },
    upfrontFee: 150,
  },
  {
    name: 'Platinum',
    minDeposit: 250,
    maxDeposit: 10000,
    maxAccounts: 40,
    profitSharing: { customer: 60, platform: 40 },
    upfrontFee: 250,
  }
];

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [userPlans, setUserPlans] = useState<UserPlan[]>([
    {
      id: 1,
      userId: 'USER123',
      plan: 'Silver',
      status: 'Active',
      startDate: '2024-03-01'
    },
    {
      id: 2,
      userId: 'T1234',
      plan: 'Gold',
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0]
    }
  ]);

  const getUserPlan = (userId: string) => {
    return userPlans.find(up => up.userId === userId);
  };

  return (
    <PlanContext.Provider value={{ 
      plans: defaultPlans, 
      userPlans, 
      setUserPlans,
      getUserPlan
    }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlans() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlans must be used within a PlanProvider');
  }
  return context;
}