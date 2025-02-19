import React, { useMemo } from 'react';
import { Users, LineChart, Wallet, Receipt, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePnL } from '../context/PnLContext';
import { useAccounts } from '../context/AccountContext';
import { useUsers } from '../context/UserContext';
import { usePlans } from '../context/PlanContext';
import { useWallets } from '../context/WalletContext';
import { useReferrals } from '../context/ReferralContext';

import { format, subDays, parseISO } from 'date-fns';

const END_DATE = new Date('2025-02-10');
const START_DATE = subDays(END_DATE, 30);

const Dashboard = () => {
  const { pnlData } = usePnL();
  const { totalAccounts } = useAccounts();
  const { totalUsers } = useUsers();
  const { userPlans, plans } = usePlans();
  const { wallets } = useWallets();
  const { getAgentForCustomer } = useReferrals();

  // Generate data for the last 30 days
  const chartData = useMemo(() => {
    const dailyData: { [key: string]: number } = {};
    let currentDate = START_DATE;

    // Initialize all dates with 0
    while (currentDate <= END_DATE) {
      dailyData[format(currentDate, 'yyyy-MM-dd')] = 0;
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    // Fill in actual PnL data
    pnlData
      .filter(entry => {
        const entryDate = parseISO(entry.date);
        return entryDate >= START_DATE && entryDate <= END_DATE;
      })
      .forEach(entry => {
        // Use total PnL before commission split
        dailyData[entry.date] = (dailyData[entry.date] || 0) + entry.totalPnL;
      });

    // Convert to array format for chart
    return Object.entries(dailyData).map(([date, pnl]) => ({
      date: format(parseISO(date), 'MMM dd'),
      pnl
    }));
  }, [pnlData]);
  // Get total active wallets count
  const activeWalletsCount = wallets.length;

  // Calculate net divine algo share (after agent commissions)
  const totalDivineAlgoShare = pnlData.reduce((total, entry) => {
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: totalUsers.toString(), icon: Users, color: 'bg-blue-500' },
          { title: 'Total Accounts', value: totalAccounts.toString(), icon: LineChart, color: 'bg-green-500' },
          { title: 'Active Divine Coins', value: activeWalletsCount.toString(), icon: Wallet, color: 'bg-purple-500' },
          { title: 'Net Divine Algo Share', value: totalDivineAlgoShare === 0 ? '0.00' : totalDivineAlgoShare.toFixed(2), icon: Receipt, color: 'bg-yellow-500' },
        ].map((stat, index) => (
          <div key={index} className="card p-6 hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 md:p-6 mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Performance</h2>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(START_DATE, 'MMM dd, yyyy')} - {format(END_DATE, 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Symbol: EURUSDc
            </div>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Total PnL: ${chartData.reduce((sum, entry) => sum + entry.pnl, 0).toFixed(2)}
          </div>
        </div>
        <div className="h-60 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickFormatter={(value) => `$${value}`}
                tick={{ fontSize: 11 }}
                domain={[0, dataMax => Math.ceil(dataMax * 1.1)]}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(79, 70, 229)" stopOpacity={1} />
                  <stop offset="100%" stopColor="rgb(79, 70, 229)" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <Bar 
                dataKey="pnl" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                minPointSize={5}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;