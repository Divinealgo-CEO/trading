import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, X, User as UserIcon } from 'lucide-react';
import { usePnL } from '../context/PnLContext';
import { usePlans } from '../context/PlanContext';
import { useWallets } from '../context/WalletContext';
import { useUsers } from '../context/UserContext';

interface PnLEntry {
  id: number;
  userId: string;
  date: string;
  symbol: string;
  totalPnL: number;
}

const PnL = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PnLEntry | null>(null);
  const { pnlData, setPnlData } = usePnL();
  const { userPlans, plans } = usePlans();
  const { wallets, setWallets } = useWallets();
  const { users } = useUsers();
  const [formData, setFormData] = useState({
    userIds: [] as string[],
    date: new Date().toISOString().split('T')[0],
    symbol: '',
    totalPnL: 0
  });
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PnLEntry | null>(null);

  const calculateDivineAlgoShare = (totalPnL: number, userId: string) => {
    const userPlan = userPlans.find(up => up.userId === userId);
    const plan = userPlan ? plans.find(p => p.name === userPlan.plan) : null;
    return plan ? (totalPnL * plan.profitSharing.platform) / 100 : 0;
  };

  const updateWalletBalance = (userId: string, amount: number) => {
    setWallets(prevWallets => 
      prevWallets.map(wallet => 
        wallet.userId === userId
          ? { ...wallet, balance: wallet.balance - amount }
          : wallet
      )
    );
  };

  const handleOpenModal = (entry?: PnLEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        userIds: [entry.userId],
        date: entry.date,
        symbol: entry.symbol,
        totalPnL: entry.totalPnL
      });
    } else {
      setEditingEntry(null);
      setFormData({
        userIds: [],
        date: new Date().toISOString().split('T')[0],
        symbol: '',
        totalPnL: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setFormData({
      userIds: [],
      date: new Date().toISOString().split('T')[0],
      symbol: '',
      totalPnL: 0
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'userIds') {
      const select = e.target as HTMLSelectElement;
      const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
      setFormData(prev => ({
        ...prev,
        userIds: selectedOptions
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowUsers = (entry: PnLEntry) => {
    setSelectedEntry(entry);
    setShowUsersModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEntry) {
      // Calculate difference in divine algo share
      const oldShare = calculateDivineAlgoShare(editingEntry.totalPnL, editingEntry.userId);
      const newShare = calculateDivineAlgoShare(Number(formData.totalPnL), editingEntry.userId);
      const shareDifference = newShare - oldShare;
      
      // Update wallet balance
      updateWalletBalance(editingEntry.userId, shareDifference);

      setPnlData(prevData =>
        prevData.map(entry =>
          entry.id === editingEntry.id
            ? {
                ...entry,
                userId: entry.userId,
                date: formData.date,
                symbol: formData.symbol,
                totalPnL: Number(formData.totalPnL)
              }
            : entry
        )
      );
    } else {
      // Create entries for each selected user
      const newEntries = formData.userIds.map((userId, index) => {
        const newEntry: PnLEntry = {
          id: Date.now() + index,
          userId,
          date: formData.date,
          symbol: formData.symbol,
          totalPnL: Number(formData.totalPnL)
        };
        
        // Calculate divine algo share and update wallet
        const divineAlgoShare = calculateDivineAlgoShare(Number(formData.totalPnL), userId);
        if (divineAlgoShare > 0) {
          updateWalletBalance(userId, divineAlgoShare);
        }

        return newEntry;
      });

      setPnlData(prevData => [...prevData, ...newEntries]);
    }
    handleCloseModal();
  };

  const handleEdit = (entry: PnLEntry) => {
    handleOpenModal(entry);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const entry = pnlData.find(e => e.id === id);
      if (entry) {
        // Refund the divine algo share to user's wallet
        const divineAlgoShare = calculateDivineAlgoShare(entry.totalPnL, entry.userId);
        if (divineAlgoShare > 0) {
          updateWalletBalance(entry.userId, -divineAlgoShare); // Negative amount to add back to wallet
        }
        
        setPnlData(prevData => prevData.filter(e => e.id !== id));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Daily PnL</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add PnL
        </button>
      </div>

      <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total PnL
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pnlData.map((entry) => (
              <tr key={entry.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{entry.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleShowUsers(entry)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-900"
                  >
                    View Users
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.symbol}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleOpenModal(entry)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-900"
                  >
                    ${entry.totalPnL.toFixed(2)}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingEntry ? 'Edit PnL Entry' : 'Add New PnL Entry'}
              </h2>
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
                  Users
                </label>
                <select
                  name="userIds"
                  multiple
                  value={formData.userIds}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 h-32"
                  required
                >
                  {users
                    .filter(user => user.status === 'Active')
                    .map(user => (
                      <option key={user.uniqueId} value={user.uniqueId}>
                        {user.username} ({user.uniqueId})
                      </option>
                    ))
                  }
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl/Cmd to select multiple users
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total PnL
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="totalPnL"
                  value={formData.totalPnL}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingEntry ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Modal */}
      {showUsersModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Details</h2>
              <button
                onClick={() => setShowUsersModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {users
                .filter(user => user.uniqueId === selectedEntry.userId)
                .map(user => {
                  const userPlan = userPlans.find(up => up.userId === user.uniqueId);
                  const plan = plans.find(p => p.name === userPlan?.plan);
                  const wallet = wallets.find(w => w.userId === user.uniqueId);

                  return (
                    <div key={user.uniqueId} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                          <p className="text-sm text-gray-500">ID: {user.uniqueId}</p>
                        </div>
                        <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Plan</p>
                          <p className="text-sm font-medium text-gray-900">
                            {plan?.name || 'No Plan'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Wallet Balance</p>
                          <p className="text-sm font-medium text-gray-900">
                            ${wallet?.balance.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowUsersModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PnL;