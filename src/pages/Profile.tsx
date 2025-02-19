import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Phone, Globe } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const userProfile = user?.user_metadata;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Profile</h1>
      
      <div className="card p-6 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{userProfile?.name}</h2>
            <p className="text-sm text-muted-foreground">ID: {userProfile?.uniqueId}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-lg">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{user?.email}</span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-lg">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{userProfile?.phone_code} {userProfile?.phone}</span>
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-lg">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{userProfile?.country || 'Not set'}</span>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Status
            </label>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                userProfile?.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {userProfile?.status || 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;