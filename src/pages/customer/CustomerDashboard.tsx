import { format, subDays, parseISO } from 'date-fns';

const END_DATE = new Date('2025-02-10');
const START_DATE = subDays(END_DATE, 30);

const CustomerDashboard = () => {
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
                 <linearGradient id="customerPnlGradient" x1="0" y1="0" x2="0" y2="1">
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