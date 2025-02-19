import React from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Silver',
    minDeposit: 250,
    maxDeposit: 500,
    profitSharing: { customer: 40, platform: 60 },
    upfrontFee: 50,
  },
  {
    name: 'Gold',
    minDeposit: 250,
    maxDeposit: 1000,
    profitSharing: { customer: 50, platform: 50 },
    upfrontFee: 150,
  },
  {
    name: 'Platinum',
    minDeposit: 250,
    maxDeposit: 10000,
    profitSharing: { customer: 60, platform: 40 },
    upfrontFee: 250,
  }
];

const Plans = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Copy Trading Plans</h1>
        <p className="mt-2 text-gray-600">
          Level up your trading with our flexible copy trading plans, designed to fit your investment goals! 
          We handle the trades, you reap the rewards. Here's how it works:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8 bg-gradient-to-br from-gray-50 to-white border-b">
              <h3 className="text-2xl font-bold text-center text-gray-900">{plan.name}</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Minimum Deposit</p>
                  <p className="text-2xl font-semibold">${plan.minDeposit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Maximum Deposit</p>
                  <p className="text-2xl font-semibold">${plan.maxDeposit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profit Sharing</p>
                  <p className="text-lg font-medium">
                    {plan.profitSharing.customer}% to you, {plan.profitSharing.platform}% to us
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Upfront Fee</p>
                  <p className="text-lg font-medium">
                    ${plan.upfrontFee} (Adjusted daily from your profit share)
                  </p>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white rounded-lg py-3 px-6 hover:bg-blue-700 transition-colors">
                Choose {plan.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;