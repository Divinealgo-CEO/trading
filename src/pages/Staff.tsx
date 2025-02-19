import React, { useState } from 'react';
import { useTeam } from '../context/StaffContext';
import { Edit2, Trash2, X, Plus, Shield, Eye, EyeOff } from 'lucide-react';

interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface ModulePermissions {
  users: Permission;
  accounts: Permission;
  pnl: Permission;
  wallets: Permission;
  transactions: Permission;
  chat: Permission;
  agents: Permission;
  plans: Permission;
}

const Staff = () => {
  const { team, setTeam, updateTeamMemberPermissions } = useTeam();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof team[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Chief Operating Officer (COO)' as const,
    status: 'Active' as const
  });

  const handleOpenModal = (member?: typeof team[0]) => {
    if (member) {
      setSelectedMember(member);
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role,
        status: member.status
      });
    } else {
      setSelectedMember(null);
      setFormData({
        name: '',
        email: '',
        role: 'Chief Operating Officer (COO)',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenPermissionsModal = (member: typeof team[0]) => {
    setSelectedMember(member);
    setIsPermissionsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember) {
      setTeam(prev => prev.map(member =>
        member.id === selectedMember.id
          ? { ...member, ...formData }
          : member
      ));
    } else {
      const newMember = {
        id: `D${String(Math.floor(100 + Math.random() * 900))}`,
        ...formData,
        permissions: {
          users: { view: true, edit: false, delete: false },
          accounts: { view: true, edit: true, delete: false },
          pnl: { view: true, edit: false, delete: false },
          wallets: { view: true, edit: false, delete: false },
          transactions: { view: true, edit: false, delete: false },
          chat: { view: true, edit: true, delete: true },
          agents: { view: true, edit: false, delete: false },
          plans: { view: true, edit: false, delete: false }
        },
        createdAt: new Date().toISOString()
      };
      setTeam(prev => [...prev, newMember]);
    }
    setIsModalOpen(false);
  };

  const handlePermissionChange = (
    module: keyof ModulePermissions,
    permission: keyof Permission,
    value: boolean
  ) => {
    if (!selectedMember) return;

    const updatedPermissions = {
      ...selectedMember.permissions,
      [module]: {
        ...selectedMember.permissions[module],
        [permission]: value
      }
    };

    updateTeamMemberPermissions(selectedMember.id, updatedPermissions);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      setTeam(prev => prev.filter(member => member.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Team Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Team ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {member.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : member.role === 'Chief Operating Officer (COO)'
                        ? 'bg-purple-100 text-purple-800'
                        : member.role === 'Chief Technology Officer (CTO)'
                        ? 'bg-indigo-100 text-indigo-800'
                        : member.role === 'Chief Marketing Officer (CMO)'
                        ? 'bg-pink-100 text-pink-800'
                        : member.role === 'Chief Advising Officer (CAO)'
                        ? 'bg-green-100 text-green-800'
                        : member.role === 'manager'
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800' 
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenPermissionsModal(member)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Manage Permissions"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Permissions
                      </button>
                      <button
                        onClick={() => handleOpenModal(member)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {selectedMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'manager' | 'support' }))}
                  className="input-field"
                  required
                >
                  <option value="Chief Operating Officer (COO)">Chief Operating Officer (COO)</option>
                  <option value="Chief Technology Officer (CTO)">Chief Technology Officer (CTO)</option>
                  <option value="Chief Marketing Officer (CMO)">Chief Marketing Officer (CMO)</option>
                  <option value="Chief Advising Officer (CAO)">Chief Advising Officer (CAO)</option>
                  <option value="manager">Manager</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
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
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {selectedMember ? 'Update' : 'Add'} Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {isPermissionsModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Manage Permissions - {selectedMember.name}
              </h2>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6">
              {Object.entries(selectedMember.permissions).map(([module, permissions]) => (
                <div key={module} className="border-b border-border pb-4">
                  <h3 className="text-lg font-medium text-foreground mb-3 capitalize">
                    {module}
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(permissions).map(([permission, value]) => (
                      <div key={permission} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {permission}
                        </span>
                        <select
                          value={value ? 'show' : 'hide'}
                          onChange={(e) => handlePermissionChange(
                            module as keyof ModulePermissions,
                            permission as keyof Permission,
                            e.target.value === 'show'
                          )}
                          className="ml-2 w-20 text-sm border border-border rounded-md px-2 py-1 bg-background"
                        >
                          <option value="show">Show</option>
                          <option value="hide">Hide</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Staff