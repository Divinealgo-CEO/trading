import { useWallets } from "../../context/WalletContext";
import { usePlans } from "../../context/PlanContext";
import { useAuth } from "../../context/AuthContext";
import { CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";

const CustomerWallet = () => {
  const { wallets } = useWallets();
  const { getUserPlan } = usePlans();
  const { user } = useAuth();
  const currentUserPlan = user ? getUserPlan(user.id) : null;
  const userWallet = user
    ? wallets.find((w) => w.userId === user.id) || {
        wallet_id: "USER123",
        userId: user.id,
        balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    : null;

  if (!currentUserPlan || currentUserPlan.status !== "Active") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          My Divine Coins
        </h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">
            Please subscribe to a plan to access your Divine Coins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">My Divine Coins</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Divine Coins Card */}
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-primary/10 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${"bg-gray-100 text-gray-800"}`}
            >
              Silver Plan
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Available Coins</p>
              <p className="text-3xl font-bold text-foreground">
                {(userWallet?.balance || 0).toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Min Deposit</p>
                <p className="text-lg font-semibold text-foreground">250</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Deposit</p>
                <p className="text-lg font-semibold text-foreground">500</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Transactions
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Profit Share
                  </p>
                  <p className="text-xs text-muted-foreground">Mar 15, 2024</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">
                +875.35
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Platform Fee
                  </p>
                  <p className="text-xs text-muted-foreground">Mar 14, 2024</p>
                </div>
              </div>
              <span className="text-sm font-medium text-red-600">-150.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerWallet;
