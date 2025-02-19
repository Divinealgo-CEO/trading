import React, { useState } from 'react';
import { CreditCard, User, Archive, X, ArrowUpRight, Edit2 } from 'lucide-react';
import type { Wallet } from '../types';
import { useUsers } from '../context/UserContext';
import { usePlans } from '../context/PlanContext';
import { useWallets } from '../context/WalletContext';

const Wallets = () => {
  const { users } = useUsers();
  const { userPlans, plans } = usePlans();
  const { wallets, setWallets, archivedWallets, setArchivedWallets } = useWallets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [newBalance, setNewBalance] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    balance: ''
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      userId: '',
      balance: ''
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
    const newWallet: Wallet = {
      wallet_id: formData.userId,
      userId: formData.userId,
      balance: parseFloat(formData.balance) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setWallets(prevWallets => [...prevWallets, newWallet]);
    handleCloseModal();
  };

  const handleArchive = (wallet: Wallet) => {
    if (window.confirm('Are you sure you want to archive this wallet?')) {
      // Remove from active wallets
      setWallets(prev => prev.filter(w => w.wallet_id !== wallet.wallet_id));
      
      // Add to archived wallets with archive timestamp
      setArchivedWallets(prev => [...prev, {
        ...wallet,
        archived_at: new Date().toISOString()
      }]);
    }
  };

  const handleEditBalance = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setNewBalance(wallet.balance.toString());
    setIsEditBalanceModalOpen(true);
  };

  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;

    setWallets(prev => prev.map(w => 
      w.wallet_id === editingWallet.wallet_id
        ? { ...w, balance: parseFloat(newBalance), updated_at: new Date().toISOString() }
        : w
    ));
    setIsEditBalanceModalOpen(false);
    setEditingWallet(null);
  };

  const displayWallets = showArchived ? archivedWallets : wallets;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Divine Coins</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              showArchived 
                ? 'bg-gray-100 text-gray-700 border-gray-300'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            <Archive className="w-4 h-4 mr-2" />
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
          {!showArchived && <button onClick={handleOpenModal} className="btn-primary">
            Create Divine Coins Account
          </button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayWallets.map((wallet) => {
          const user = users.find(u => u.uniqueId === wallet.userId);
          const userPlan = userPlans.find(up => up.userId === wallet.userId);
          const plan = plans.find(p => p.name === userPlan?.plan);

          return (
          <div key={wallet.wallet_id} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                {showArchived && (
                  <span className="text-muted-foreground text-sm mr-4">
                    Archived: {new Date(wallet.archived_at).toLocaleDateString()}
                  </span>
                )}
              </span>
            </div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {user?.username || 'Unknown User'}
                </div>
                <div className="text-sm text-muted-foreground">ID: {wallet.userId}</div>
              </div>
              <span className={`ml-auto px-2 py-1 text-xs font-semibold rounded-full ${
                user?.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {user?.status || 'Unknown'}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Plan</span>
                {plan ? (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    plan.name === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                    plan.name === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {plan.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No Active Plan</span>
                )}
              </div>
              {plan && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Profit Share: {plan.profitSharing.customer}% / {plan.profitSharing.platform}%
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm font-medium text-muted-foreground">Balance</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-foreground">
                    {wallet.balance.toFixed(2)}
                  </span>
                  {!showArchived && (
                    <button
                      onClick={() => handleEditBalance(wallet)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              {!showArchived && (
                <button
                  onClick={() => handleArchive(wallet)}
                  className="w-full bg-destructive/10 text-destructive px-4 py-2 rounded-lg hover:bg-destructive/20 transition-colors"
                >
                  Archive Divine Coins Account
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* Create Wallet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Divine Coins Account</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.uniqueId} value={user.uniqueId}>
                      {user.username} ({user.uniqueId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Coins
                </label>
                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {isEditBalanceModalOpen && editingWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Wallet Balance</h2>
              <button
                onClick={() => setIsEditBalanceModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateBalance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                  {users.find(u => u.uniqueId === editingWallet.userId)?.username || 'Unknown User'} ({editingWallet.userId})
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                  {editingWallet.balance.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditBalanceModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;