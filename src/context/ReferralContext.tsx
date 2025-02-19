import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Referral {
  id: string;
  agentId: string;
  customerId: string;
  signupDate: string;
  isManualAssignment: boolean;
  isActive: boolean;  // Tracks if the referred user has activated a plan
}

interface ReferralContextType {
  referrals: Referral[];
  setReferrals: React.Dispatch<React.SetStateAction<Referral[]>>;
  getReferralsByAgent: (agentId: string) => Referral[];
  getAgentForCustomer: (customerId: string) => string | undefined;
  addReferral: (agentId: string, customerId: string, isManual?: boolean) => void;
  generateReferralLink: (agentId: string) => string;
  validateReferralCode: (code: string) => string | null;
  activateReferral: (customerId: string) => void;
  isAgent: (userId: string) => boolean;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export function ReferralProvider({ children }: { children: ReactNode }) {
  const [referrals, setReferrals] = useState<Referral[]>([
    {
      id: '1',
      agentId: 'A1234',
      customerId: 'B5678',
      signupDate: '2024-03-15',
      isManualAssignment: false,
      isActive: true
    },
    {
      id: '2',
      agentId: 'A1234',
      customerId: 'C9012',
      signupDate: '2024-03-16',
      isManualAssignment: true,
      isActive: true
    }
  ]);

  const getReferralsByAgent = (agentId: string) => {
    return referrals.filter(ref => ref.agentId === agentId);
  };

  const getAgentForCustomer = (customerId: string) => {
    const referral = referrals.find(ref => ref.customerId === customerId);
    return referral?.agentId;
  };

  const isAgent = (userId: string) => {
    // A user is an agent if they have at least one active referral
    return referrals.some(ref => 
      ref.agentId === userId && ref.isActive
    );
  };

  const activateReferral = (customerId: string) => {
    setReferrals(prev => prev.map(ref =>
      ref.customerId === customerId
        ? { ...ref, isActive: true }
        : ref
    ));
  };

  const addReferral = (agentId: string, customerId: string, isManual = false) => {
    // Prevent self-referrals
    if (agentId === customerId) return;

    // Check if customer is already referred
    if (getAgentForCustomer(customerId)) return;

    const newReferral: Referral = {
      id: Date.now().toString(),
      agentId,
      customerId,
      signupDate: new Date().toISOString(),
      isManualAssignment: isManual,
      isActive: false
    };

    setReferrals(prev => [...prev, newReferral]);
  };

  const generateReferralLink = (agentId: string) => {
    const baseUrl = window.location.origin;
    const encodedId = btoa(agentId);
    return `${baseUrl}/register?ref=${encodedId}`;
  };

  const validateReferralCode = (code: string): string | null => {
    try {
      return atob(code);
    } catch {
      return null;
    }
  };

  return (
    <ReferralContext.Provider value={{
      referrals,
      setReferrals,
      getReferralsByAgent,
      getAgentForCustomer,
      addReferral,
      generateReferralLink,
      validateReferralCode,
      activateReferral,
      isAgent
    }}>
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferrals() {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error('useReferrals must be used within a ReferralProvider');
  }
  return context;
}