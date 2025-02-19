import React, { useState } from 'react';
import { Search, TrendingUp, Wallet } from 'lucide-react';
import { usePnL } from '../context/PnLContext';
import { usePlans } from '../context/PlanContext';
import { useWallets } from '../context/WalletContext';
import { useReferrals } from '../context/ReferralContext';
import { useUsers } from '../context/UserContext';
import { format } from 'date-fns';

const Transactions = () => {
  const { pnlData } = usePnL();
  const { userPlans, plans } = usePlans();
  const { users } = useUsers();
  const { wallets, totalWalletValue } = useWallets();
  const { getAgentForCustomer } = useReferrals();
  const [searchTerm, setSearchTerm] = useState(''); 

  // Calculate total realized profit (divine algo share after agent commissions)
  const totalRealizedProfit = pnlData.reduce((total, entry) => {
    if (entry.totalPnL <= 0) return total;
    
    const userPlan = userPlans.find(up => up.userId === entry.userId);
    if (userPlan) {
      const plan = plans.find(p => p.name === userPlan.plan);
      if (plan) {
        const divineAlgoShare = (entry.totalPnL * plan.profitSharing.platform) / 100;
        const agentId = getAgentForCustomer(entry.userId);
        const agentCommission = agentId ? divineAlgoShare * 0.3 : 0;
        return total + (divineAlgoShare - agentCommission);
      }
    }
    return total;
  }, 0);

  // Calculate total unrealized profit (active wallet balances)
  const totalUnrealizedProfit = totalWalletValue;

  // Filter and sort transactions
  const filteredTransactions = pnlData
    .filter(entry => {
      const user = users.find(u => u.uniqueId === entry.userId);
      if (!user) return false;
      
      const searchString = `${user.username} ${user.uniqueId} ${entry.symbol}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Realized Profit Card */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-primary/10 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Net Divine Algo Share (After Agent Commissions)</p>
              <p className="text-2xl font-semibold text-foreground">${totalRealizedProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Unrealized Profit Card */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-primary/10 rounded-lg p-3">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Active Divine Coins (Unrealized)</p>
              <p className="text-2xl font-semibold text-foreground">{totalUnrealizedProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by username, ID or symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total PnL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Share
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Divine Algo Share
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent Commission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTransactions.map((entry) => {
              const user = users.find(u => u.uniqueId === entry.userId);
              const userPlan = userPlans.find(up => up.userId === entry.userId);
              const plan = plans.find(p => p.name === userPlan?.plan);
              const divineAlgoShare = plan
                ? (entry.totalPnL * plan.profitSharing.platform) / 100
                : 0;
              const agentId = getAgentForCustomer(entry.userId); 
              const agentCommission = agentId && divineAlgoShare > 0 
                ? divineAlgoShare * 0.3 
                : 0;
              const netDivineAlgoShare = divineAlgoShare - agentCommission;

              return user && (
              <tr key={entry.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.uniqueId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(entry.date), 'MMM dd, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                    {entry.symbol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`text-sm font-medium ${
                    entry.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${entry.totalPnL.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`text-sm font-medium ${
                    entry.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${((entry.totalPnL * plan?.profitSharing.customer) / 100).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`text-sm font-medium ${
                    netDivineAlgoShare >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${netDivineAlgoShare.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {agentCommission > 0 ? (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-purple-600">
                        ${agentCommission.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        (Agent: {agentId})
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {plan ? (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      plan.name === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                      plan.name === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.name} ({plan.profitSharing.platform}%)
                    </span>
                  ) : <span className="text-sm text-gray-500">No Plan</span>}
                </td>
              </tr>
              ) || null;
            })}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;