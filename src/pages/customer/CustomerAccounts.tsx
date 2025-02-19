import React, { useState } from 'react';
import { useAccounts } from '../../context/AccountContext';
import { usePlans } from '../../context/PlanContext';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, X } from 'lucide-react';

const CustomerAccounts = () => {
  const { accounts, setAccounts } = useAccounts();
  const { getUserPlan, plans } = usePlans();
  const { user } = useAuth();
  const currentUserPlan = user ? getUserPlan(user.id) : null;
  const planDetails = plans.find(p => p.name === 'Silver');
  const maxAccounts = 2; // Silver plan limit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const userAccounts = user ? accounts.filter(acc => acc.userId === user.id).slice(0, maxAccounts) : [];
  const [formData, setFormData] = useState({
    account_no: '',
    server: 'MT4-Live',
    password: ''
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      account_no: '',
      server: 'MT4-Live',
      password: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount = {
      id: Date.now(),
      userId: 'USER123', // This should come from auth context
      ...formData,
      status: 'Pending' as const
    };
    setAccounts(prev => [...prev, newAccount]);
    handleCloseModal();
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Trading Accounts</h1>
        {!currentUserPlan || currentUserPlan.status !== 'Active' ? (
          <div className="text-sm text-red-600">
            Please subscribe to a plan to create trading accounts
          </div>
        ) : (
        <button
          onClick={() => userAccounts.length < maxAccounts && handleOpenModal()}
          className={`px-4 py-2 rounded-lg ${
            userAccounts.length >= 2
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          disabled={userAccounts.length >= 2}
        >
          Add Account
          {userAccounts.length >= 2 && ' (Max 2 Accounts Reached)'}
        </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Account No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Server
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {userAccounts.map((account) => (
              <tr key={account.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">
                    {account.account_no}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{account.server}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground flex items-center">
                    {showPassword[account.id] ? account.password : '••••••••'}
                    <button
                      onClick={() => togglePasswordVisibility(account.id)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword[account.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    account.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : account.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {account.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">Add Trading Account</h2>
              <button
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="account_no"
                  value={formData.account_no}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Server
                </label>
                <select
                  name="server"
                  value={formData.server}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="MT4-Live">MT4-Live</option>
                  <option value="MT4-Demo">MT4-Demo</option>
                  <option value="MT5-Live">MT5-Live</option>
                  <option value="MT5-Demo">MT5-Demo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAccounts;