import React, { useState } from 'react';
import { usePlans } from '../context/PlanContext';
import { useUsers } from '../context/UserContext';
import { useWallets } from '../context/WalletContext';
import { useReferrals } from '../context/ReferralContext';
import { Edit2, Trash2, X } from 'lucide-react';

const ManagePlans = () => {
  const { plans, userPlans, setUserPlans } = usePlans();
  const { users } = useUsers();
  const { wallets, setWallets } = useWallets();
  const { activateReferral } = useReferrals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<typeof userPlans[0] | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    plan: 'Silver' as const,
    status: 'Active' as const
  });

  const handleOpenModal = (userPlan?: typeof userPlans[0]) => {
    if (userPlan) {
      setEditingPlan(userPlan);
      setFormData({
        userId: userPlan.userId,
        plan: userPlan.plan,
        status: userPlan.status
      });
    } else {
      setEditingPlan(null);
      setFormData({
        userId: '',
        plan: 'Silver',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      setUserPlans(prev => 
        prev.map(up =>
          up.userId === editingPlan.userId
            ? { ...up, ...formData, startDate: new Date().toISOString().split('T')[0] }
            : up
        )
      );
    } else {
      const newUserPlan = {
        ...formData,
        id: Date.now(), // Add a unique ID for each plan
        startDate: new Date().toISOString().split('T')[0]
      };
      setUserPlans(prev => [...prev, newUserPlan]);
      
      // Create a wallet for the user if they don't have one
      const existingWallet = wallets.find(w => w.userId === formData.userId);
      if (!existingWallet) {
        const newWallet = {
          wallet_id: formData.userId,
          userId: formData.userId,
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setWallets(prev => [...prev, newWallet]);
      }
      
      // Activate referral if user was referred
      activateReferral(formData.userId);
    }
    handleCloseModal();
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setUserPlans(prev => prev.filter(up => up.userId !== userId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Plans</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Assign Plan
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit Share
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-border">
            {userPlans.map((userPlan) => {
              const user = users.find(u => u.uniqueId === userPlan.userId) || { username: 'Unknown User', status: 'Inactive' };
              const plan = plans.find(p => p.name === userPlan.plan);
              
              return (
                <tr key={userPlan.userId} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.username || 'Unknown User'}
                   </div>
                    <div className="text-sm text-gray-500">{userPlan.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userPlan.plan === 'Platinum'
                        ? 'bg-purple-100 text-purple-800'
                        : userPlan.plan === 'Gold'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userPlan.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userPlan.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userPlan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(userPlan.startDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {plan?.profitSharing.customer}% / {plan?.profitSharing.platform}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenModal(userPlan)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(userPlan.userId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {editingPlan ? 'Edit User Plan' : 'Assign New Plan'}
              </h2>
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
                  User
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select User</option>
                  {users.filter(user => !userPlans.some(up => up.userId === user.uniqueId)).map(user => (
                    <option key={user.uniqueId} value={user.uniqueId}>
                      {user.username} ({user.uniqueId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Plan
                </label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  {plans.map(plan => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {editingPlan ? 'Update' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlans;