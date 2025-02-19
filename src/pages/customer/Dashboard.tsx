import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePnL } from '../../context/PnLContext';
import { useAccounts } from '../../context/AccountContext';
import { useWallets } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { Wallet, LineChart, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

const END_DATE = new Date('2025-02-10');
const START_DATE = subDays(END_DATE, 30);

const CustomerDashboard = () => {
  const { pnlData } = usePnL();
  const { accounts } = useAccounts();
  const { wallets } = useWallets();
  const { user } = useAuth();

  // Calculate total earnings from your share in daily PnL
  const totalEarnings = user ? pnlData
    .filter(entry => entry.userId === user.id)
    .reduce((sum, entry) => sum + ((entry.totalPnL * 40) / 100), 0) : 0;

  // Get count of approved accounts for the current user
  const activeAccounts = accounts.filter(acc => 
    acc.userId === user?.id && 
    acc.status === 'Approved'
  ).length;
  
  // Get wallet balance for the current user
  const userWallet = user ? wallets.find(w => w.userId === user.id) : null;

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
    if (user) {
      pnlData
        .filter(entry => {
          const entryDate = parseISO(entry.date);
          return (
            entry.userId === user.id &&
            entryDate >= START_DATE &&
            entryDate <= END_DATE
          );
        })
        .forEach(entry => {
          // Use total PnL before commission split
          dailyData[entry.date] = (dailyData[entry.date] || 0) + entry.totalPnL;
        });
    }

    // Convert to array format for chart
    return Object.entries(dailyData).map(([date, pnl]) => ({
      date: format(parseISO(date), 'MMM dd'),
      pnl
    }));
  }, [pnlData, user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earnings Card */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-semibold text-foreground">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Active Accounts Card */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <LineChart className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
              <p className="text-2xl font-semibold text-foreground">{activeAccounts}</p>
            </div>
          </div>
        </div>

        {/* Divine Coins Card */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Divine Coins</p>
              <p className="text-2xl font-semibold text-foreground">${(userWallet?.balance || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 md:p-6">
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
                domain={[0, 'auto']}
                orientation="left"
                width={80}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']}
                labelFormatter={(label) => `Date: ${label}`}
                cursor={{ fill: 'transparent' }}
              />
              <defs>
                <linearGradient id="customerPnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(79, 70, 229)" stopOpacity={1} />
                  <stop offset="100%" stopColor="rgb(79, 70, 229)" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <Bar 
                dataKey="pnl" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                minPointSize={2}
                isAnimationActive={false}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;