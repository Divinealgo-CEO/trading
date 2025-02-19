import React from 'react';
import { usePnL } from '../../context/PnLContext';
import { usePlans } from '../../context/PlanContext';
import { useAuth } from '../../context/AuthContext';
import { Lock, Wallet } from 'lucide-react';

const CustomerPnL = () => {
  const { pnlData } = usePnL();
  const { getUserPlan, plans } = usePlans();
  const { user } = useAuth();
  const currentUserPlan = user ? getUserPlan(user.id) : null;
  const planDetails = plans.find(p => p.name === 'Silver');
  const profitSharingRatio = currentUserPlan ? 
    plans.find(p => p.name === currentUserPlan.plan)?.profitSharing : 
    { customer: 40, platform: 60 };
  
  // Filter PnL data for current user only
  const userPnLData = user ? pnlData.filter(entry => entry.userId === user.id) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Daily PnL</h1>

      {!currentUserPlan?.status === 'Active' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              Subscribe to a plan to view detailed profit sharing information
            </p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total PnL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your Share ({profitSharingRatio?.customer}%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Divine Algo Share ({profitSharingRatio?.platform}%)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {userPnLData.map((entry) => (
              <tr key={entry.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{entry.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{entry.symbol}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">
                    ${entry.totalPnL.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${entry.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${((entry.totalPnL * profitSharingRatio.customer) / 100).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${entry.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${((entry.totalPnL * profitSharingRatio.platform) / 100).toFixed(2)}
                  </div>
                </td>
              </tr>
            ))}
            {userPnLData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                  No PnL data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerPnL;