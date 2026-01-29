import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Users,
  Lock,
  Bell,
  Save,
  RefreshCw,
  UserPlus,
  Mail,
  Shield,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { ManageMemberPermissionsModal } from './ManageMemberPermissionsModal';

type SettingsTab = 'profile' | 'company' | 'departments' | 'team' | 'security' | 'preferences';

export function Settings() {
  const { user, company, departments } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [enablePermissionsScreen, setEnablePermissionsScreen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'team') {
      loadTeamMembers();
    }
    if (activeTab === 'preferences' && user?.role === 'admin') {
      loadSystemSettings();
    }
  }, [activeTab]);

  const loadTeamMembers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', company?.id);

    setTeamMembers(data || []);
    setLoading(false);
  };

  const loadSystemSettings = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', 'enable_document_permissions_screen')
      .maybeSingle();

    if (data) {
      setEnablePermissionsScreen(data.setting_value?.enabled || false);
    }
  };

  const savePermissionsSetting = async () => {
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          setting_value: { enabled: enablePermissionsScreen }
        })
        .eq('setting_key', 'enable_document_permissions_screen');

      if (!error) {
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleManagePermissions = (member: any) => {
    setSelectedMember(member);
    setShowPermissionsModal(true);
  };

  const handlePermissionsSaved = () => {
    loadTeamMembers();
  };

  const tabs = [
    { id: 'profile', label: 'Account Information', icon: User },
    { id: 'company', label: 'Organization Details', icon: Building2 },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'security', label: 'Change Password', icon: Lock },
    { id: 'preferences', label: 'Manage Notifications', icon: Bell },
  ] as const;

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Home</span>
            <span>/</span>
            <span>Settings</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>

                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">
                        Upload Photo
                      </button>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.full_name}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        value={user?.role}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 capitalize"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={company?.name}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Organization Details</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      defaultValue={company?.name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-emerald-600" />
                      </div>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        Upload Logo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                    <div className="space-y-2">
                      {departments.map((dept) => (
                        <div
                          key={dept.id}
                          className="px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-900">{dept.name}</span>
                          {user?.role === 'admin' && (
                            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                              Edit
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {user?.role === 'admin' && (
                      <button className="mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        + Add Department
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={loadTeamMembers}
                      className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    {user?.role === 'admin' && (
                      <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium">
                        <UserPlus className="w-4 h-4" />
                        Add New User
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        {(user?.role === 'admin' || user?.site_role === 'Permission Manager') && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={(user?.role === 'admin' || user?.site_role === 'Permission Manager') ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : teamMembers.length === 0 ? (
                        <tr>
                          <td colSpan={(user?.role === 'admin' || user?.site_role === 'Permission Manager') ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                            No team members found
                          </td>
                        </tr>
                      ) : (
                        teamMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{member.full_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{member.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                  member.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {member.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                Active
                              </span>
                            </td>
                            {(user?.role === 'admin' || user?.site_role === 'Permission Manager') && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleManagePermissions(member)}
                                  className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <SettingsIcon className="w-4 h-4" />
                                  Manage Permissions
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {showPermissionsModal && selectedMember && (
              <ManageMemberPermissionsModal
                isOpen={showPermissionsModal}
                onClose={() => {
                  setShowPermissionsModal(false);
                  setSelectedMember(null);
                }}
                member={selectedMember}
                departments={departments}
                onSave={handlePermissionsSaved}
              />
            )}

            {activeTab === 'security' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">Password Requirements</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>At least 8 characters long</li>
                          <li>Contains at least one uppercase letter</li>
                          <li>Contains at least one lowercase letter</li>
                          <li>Contains at least one number</li>
                          <li>Contains at least one special character</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium">
                      <Lock className="w-4 h-4" />
                      Update Password
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Notifications</h2>

                <div className="space-y-6">
                  {user?.role === 'admin' && (
                    <div className="border-b border-gray-200 pb-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions Management</h3>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Enable Document Permissions Screen</p>
                          <p className="text-sm text-gray-500">Allow users to manage document-level permissions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enablePermissionsScreen}
                            onChange={(e) => setEnablePermissionsScreen(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={savePermissionsSetting}
                          disabled={savingSettings}
                          className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4" />
                          {savingSettings ? 'Saving...' : 'Save Settings'}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email updates about your documents</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Task Reminders</p>
                        <p className="text-sm text-gray-500">Get notified about upcoming task deadlines</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Document Shares</p>
                        <p className="text-sm text-gray-500">Notifications when documents are shared with you</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Weekly Summary</p>
                        <p className="text-sm text-gray-500">Receive a weekly summary of your activity</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium">
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
