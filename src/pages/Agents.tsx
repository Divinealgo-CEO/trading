import React, { useState } from 'react';
import { useReferrals } from '../context/ReferralContext';
import { useUsers } from '../context/UserContext';
import { usePnL } from '../context/PnLContext';
import { format } from 'date-fns';
import { Users, Search, Edit2, X, Plus, Link as LinkIcon, Link } from 'lucide-react';

const Agents = () => {
  const { referrals, addReferral } = useReferrals();
  const { users } = useUsers();
  const { pnlData } = usePnL();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showAssignCustomerModal, setShowAssignCustomerModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const handleAssignUser = () => {
    if (!selectedAgent || !selectedUserId) return;
    
    addReferral(selectedAgent, selectedUserId, true);
    setShowAssignUserModal(false);
    setSelectedUserId('');
  };

  // Get unique agent IDs
  const agentIds = [...new Set(referrals.map(ref => ref.agentId))];

  // Calculate agent statistics
  const agentStats = agentIds.map(agentId => {
    const agentReferrals = referrals.filter(ref => ref.agentId === agentId);
    const agent = users.find(u => u.uniqueId === agentId);
    
    // Calculate total earnings (30% of Divine Algo's share)
    const totalEarnings = pnlData.reduce((total, entry) => {
      const isReferredCustomer = agentReferrals.some(ref => ref.customerId === entry.userId);
      if (!isReferredCustomer || entry.totalPnL <= 0) return total;
      
      const divineAlgoShare = entry.totalPnL * 0.6; // 60% is divine algo share
      const agentCommission = divineAlgoShare * 0.3; // 30% of divine algo share
      return total + agentCommission;
    }, 0);

    return {
      agentId,
      agentName: agent?.username || 'Unknown Agent',
      referralCount: agentReferrals.length,
      totalEarnings,
      referrals: agentReferrals
    };
  });

  const filteredAgents = agentStats.filter(agent => 
    agent.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowDetails = (agentId: string) => {
    setSelectedAgent(agentId);
    setShowDetailsModal(true);
  };

  const handleAddAgent = () => {
    if (!selectedUserId) return;
    
    // Create a dummy customer ID to establish the user as an agent
    const dummyCustomerId = `DUMMY_${Date.now()}`;
    addReferral(selectedUserId, dummyCustomerId);
    setShowAddAgentModal(false);
    setSelectedUserId('');
  };

  const handleAssignCustomer = () => {
    if (!selectedAgent || !selectedCustomerId) return;
    
    addReferral(selectedAgent, selectedCustomerId, true);
    setShowAssignCustomerModal(false);
    setSelectedCustomerId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Agent Management</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAssignUserModal(true)}
            className="btn-secondary"
          >
            <Link className="h-4 w-4 mr-2" />
            Assign User to Agent
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
          <button
            onClick={() => setShowAddAgentModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </button>
        </div>
      </div>

      {/* Assign User Modal */}
      {showAssignUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Assign User to Agent</h2>
              <button
                onClick={() => setShowAssignUserModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Select Agent
                </label>
                <select
                  value={selectedAgent || ''}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="input-field"
                >
                  <option value="">Choose an agent...</option>
                  {agentStats.map(agent => (
                    <option key={agent.agentId} value={agent.agentId}>
                      {agent.agentName} ({agent.agentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Select User to Assign
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Choose a user...</option>
                  {users
                    .filter(user => 
                      user.status === 'Active' && 
                      !referrals.some(ref => ref.customerId === user.uniqueId)
                    )
                    .map(user => (
                      <option key={user.uniqueId} value={user.uniqueId}>
                        {user.username} ({user.uniqueId})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignUserModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignUser}
                  disabled={!selectedAgent || !selectedUserId}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <div key={agent.agentId} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedAgent(agent.agentId);
                    setShowAssignCustomerModal(true);
                  }}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShowDetails(agent.agentId)}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View Details
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{agent.agentName}</h3>
            <p className="text-sm text-muted-foreground mb-4">ID: {agent.agentId}</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Customers Referred</span>
                <span className="text-sm font-medium text-foreground">{agent.referralCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Earnings</span>
                <span className="text-sm font-medium text-green-600">${agent.totalEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Details Modal */}
      {showDetailsModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Agent Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {(() => {
              const agent = agentStats.find(a => a.agentId === selectedAgent);
              if (!agent) return null;

              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{agent.agentName}</h3>
                      <p className="text-sm text-muted-foreground">ID: {agent.agentId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${agent.totalEarnings.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Referred Customers</h4>
                    <div className="bg-muted rounded-lg divide-y divide-border">
                      {agent.referrals.map(referral => {
                        const customer = users.find(u => u.uniqueId === referral.customerId);
                        return (
                          <div key={referral.id} className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium">{customer?.username || 'Unknown Customer'}</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">ID: {referral.customerId}</p>
                                {referral.isManualAssignment && (
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                    Manually Assigned
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                Joined {format(new Date(referral.signupDate), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {showAddAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New Agent</h2>
              <button
                onClick={() => setShowAddAgentModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Select User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Choose a user...</option>
                  {users
                    .filter(user => 
                      user.status === 'Active' && 
                      !agentIds.includes(user.uniqueId)
                    )
                    .map(user => (
                      <option key={user.uniqueId} value={user.uniqueId}>
                        {user.username} ({user.uniqueId})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAgentModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAgent}
                  disabled={!selectedUserId}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Customer Modal */}
      {showAssignCustomerModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Assign Customer to Agent</h2>
              <button
                onClick={() => setShowAssignCustomerModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Select Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Choose a customer...</option>
                  {users
                    .filter(user => 
                      user.status === 'Active' && 
                      !agentIds.includes(user.uniqueId) &&
                      !referrals.some(ref => ref.customerId === user.uniqueId)
                    )
                    .map(user => (
                      <option key={user.uniqueId} value={user.uniqueId}>
                        {user.username} ({user.uniqueId})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignCustomerModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignCustomer}
                  disabled={!selectedCustomerId}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;