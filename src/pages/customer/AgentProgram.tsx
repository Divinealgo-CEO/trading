import { usePnL } from "../../context/PnLContext";
import { useAuth } from "../../context/AuthContext";
import { useReferrals } from "../../context/ReferralContext";
import { usePlans } from "../../context/PlanContext";
import { format } from "date-fns";
import { Users, Copy, Check } from "lucide-react";
import { useState } from "react";

const AgentProgram = () => {
  const { pnlData } = usePnL();
  const { user } = useAuth();
  const { getReferralsByAgent, generateReferralLink, isAgent } = useReferrals();
  const { getUserPlan } = usePlans();
  const [copied, setCopied] = useState(false);

  const referralLink = user ? generateReferralLink(user.id) : "";
  const myReferrals = user ? getReferralsByAgent(user.id) : [];
  const isUserAgent = user ? isAgent(user.id) : false;
  const activeReferrals = myReferrals.filter((ref) => ref.isActive);

  // Filter PnL data for referred customers
  const referredCustomersPnL = pnlData.filter(
    (entry) =>
      myReferrals.some((ref) => ref.customerId === entry.userId) &&
      entry.totalPnL > 0
  );

  // Calculate total agent earnings (30% of divine algo share)
  const totalAgentEarnings = referredCustomersPnL.reduce((total, entry) => {
    const divineAlgoShare = entry.totalPnL * 0.6; // 60% is divine algo share
    const agentShare = divineAlgoShare * 0.3; // 30% of divine algo share
    return total + agentShare;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Agent Program</h1>
      </div>

      {/* Agent Earnings Card */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="flex items-center">
          <div className="bg-purple-100 rounded-lg p-3">
            <Users
              className={`h-6 w-6 ${
                isUserAgent ? "text-purple-600" : "text-gray-400"
              }`}
            />
          </div>
          <div className="ml-4">
            {isUserAgent ? (
              <>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Total Agent Earnings
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${totalAgentEarnings.toFixed(2)}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Become an Agent
                </p>
                <p className="text-sm text-gray-500">
                  Refer a user and earn 30% commission on their profits once
                  they activate a plan!
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Agent Program Info */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">How It Works</h2>
        <div className="prose text-gray-600 text-sm md:text-base">
          <p className="text-sm md:text-base mb-6">
            {isUserAgent
              ? "As an agent, you earn 30% of Divine Algo's share from your referred customers' profitable trades."
              : "Share your referral link with others. Once they sign up and activate a plan, you'll automatically become an agent and start earning commissions!"}
          </p>
          <ul className="list-disc pl-4 md:pl-5 space-y-2">
            <li>Refer new customers to our platform</li>
            <li>
              Earn 30% of Divine Algo's share from their profitable trades
            </li>
            <li>No limit on the number of referrals</li>
            <li>Earnings are automatically credited to your Divine Coins</li>
          </ul>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Your Referral Link
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            {!isUserAgent && activeReferrals.length === 0 && (
              <p className="mt-4 text-sm text-gray-500">
                Share your link and start earning! You'll become an agent once
                your first referral activates a plan.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden text-sm md:text-base">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isUserAgent ? "Referred Customer Transactions" : "Your Referrals"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer ID
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PnL
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Share (30% of Divine Algo Share)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referredCustomersPnL.map((entry) => {
                const divineAlgoShare = entry.totalPnL * 0.6; // 60% is divine algo share
                const agentShare = divineAlgoShare * 0.3; // 30% of divine algo share

                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm font-medium text-gray-900">
                        {entry.userId}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm text-gray-900">
                        {format(new Date(entry.date), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs md:text-sm font-medium bg-gray-100 rounded-full">
                        {entry.symbol}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          referral.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {referral.isActive
                          ? "Active"
                          : "Pending Plan Activation"}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm font-medium text-green-600">
                        ${entry.totalPnL.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm font-medium text-purple-600">
                        ${agentShare.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {referredCustomersPnL.length === 0 && (
                <tr className="text-xs md:text-sm">
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No transactions found for referred customers
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentProgram;
