import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, Eye, EyeOff, X, User as UserIcon, Filter } from 'lucide-react';
import { useAccounts } from '../context/AccountContext';
import { useUsers } from '../context/UserContext';

interface AccountFormData {
  userId: string;
  account_no: string;
  server: string;
  password: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
const Accounts = () => {
  const { accounts, setAccounts } = useAccounts();
  const { users } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [editingAccount, setEditingAccount] = useState<(typeof accounts)[0] | null>(null);
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [formData, setFormData] = useState<AccountFormData>({
    userId: '',
    account_no: '',
    server: 'MT4-Live',
    password: '',
    status: 'Pending'
  });

  const handleOpenModal = (account?: typeof accounts[0]) => {
    if (account) {
      setEditingAccount(account);
      setSelectedUserId(account.userId);
      setFormData({
        userId: account.userId,
        account_no: account.account_no,
        server: account.server,
        password: account.password,
        status: account.status
      });
    } else {
      setEditingAccount(null);
      setSelectedUserId('');
      setFormData({
        userId: '',
        account_no: '',
        server: 'MT4-Live',
        password: '',
        status: 'Pending'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setSelectedUserId('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'userId') {
      setSelectedUserId(value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredAccounts = accounts.filter(account => 
    statusFilter === 'all' ? true : account.status === statusFilter
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      setAccounts(prevAccounts =>
        prevAccounts.map(account =>
          account.id === editingAccount.id
            ? { ...account, ...formData }
            : account
        )
      );
    } else {
      const newAccount = {
        id: Date.now(),
        ...formData
      };
      setAccounts(prevAccounts => [...prevAccounts, newAccount]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setAccounts(prevAccounts => prevAccounts.filter(account => account.id !== id));
    }
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleUserClick = (userId: string) => {
    const user = users.find(u => u.uniqueId === userId);
    if (user) {
      setSelectedUser(user);
      setShowUserModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Pending' | 'Approved' | 'Rejected')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Account
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unique ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Server
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {filteredAccounts.map((account) => (
              <tr key={account.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleUserClick(account.userId)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-900"
                  >
                    {account.userId}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{account.account_no}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{account.server}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <span>{showPassword[account.id] ? account.password : '••••••••'}</span>
                    <button
                      onClick={() => togglePasswordVisibility(account.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handleOpenModal(account)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(account.id)}
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingAccount ? 'Edit Account' : 'Add New Account'}
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
                  User
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select your user ID</option>
                  {users
                    .filter(user => user.status === 'Active')
                    .map(user => (
                      <option key={user.uniqueId} value={user.uniqueId}>
                        {user.uniqueId} - {user.username}
                      </option>
                    ))
                  }
                </select>
                {selectedUserId && (
                  <p className="mt-1 text-sm text-gray-500">
                    Selected User: {users.find(u => u.uniqueId === selectedUserId)?.username}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="account_no"
                  value={formData.account_no}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Server
                </label>
                <input
                  type="text"
                  name="server"
                  value={formData.server}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                  placeholder="Enter server address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
                  {editingAccount ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-gray-500" />
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium text-gray-900">{selectedUser.username}</h3>
                  <p className="text-sm text-gray-500">ID: {selectedUser.uniqueId}</p>
                </div>
                <span className={`ml-auto px-3 py-1 text-sm font-semibold rounded-full ${
                  selectedUser.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedUser.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                    {selectedUser.phoneCode} {selectedUser.phone}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Associated Accounts</label>
                  <div className="bg-gray-50 p-2 rounded-md space-y-2">
                    {accounts
                      .filter(acc => acc.userId === selectedUser.uniqueId)
                      .map(acc => (
                        <div key={acc.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">Account: {acc.account_no}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            acc.status === 'Approved' 
                              ? 'bg-green-100 text-green-800'
                              : acc.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {acc.status}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowUserModal(false)}
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

export default Accounts