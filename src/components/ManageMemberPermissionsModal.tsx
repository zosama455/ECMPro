import { useState, useEffect } from 'react';
import { X, Save, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User, Department, UserDepartmentRole, UserDepartmentPermissions } from '../types';

interface ManageMemberPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: User;
  departments: Department[];
  onSave: () => void;
}

interface DepartmentSelection {
  departmentId: string;
  isSelected: boolean;
  role: 'Department User' | 'Department Manager';
}

const SITE_ROLES = ['Site Manager', 'Permission Manager', 'Contributor', 'Consumer', 'Collaborator'];

export function ManageMemberPermissionsModal({
  isOpen,
  onClose,
  member,
  departments,
  onSave,
}: ManageMemberPermissionsModalProps) {
  const [siteRole, setSiteRole] = useState<string>(member.site_role || 'Contributor');
  const [departmentSelections, setDepartmentSelections] = useState<Record<string, DepartmentSelection>>({});
  const [selectedConfigDepartment, setSelectedConfigDepartment] = useState<string>('');
  const [permissions, setPermissions] = useState<Record<string, Partial<UserDepartmentPermissions>>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadMemberData();
    }
  }, [isOpen, member.id]);

  const loadMemberData = async () => {
    setLoading(true);

    const { data: roles } = await supabase
      .from('user_department_roles')
      .select('*')
      .eq('user_id', member.id);

    const { data: perms } = await supabase
      .from('user_department_permissions')
      .select('*')
      .eq('user_id', member.id);

    const selections: Record<string, DepartmentSelection> = {};
    departments.forEach(dept => {
      const role = roles?.find(r => r.department_id === dept.id);
      selections[dept.id] = {
        departmentId: dept.id,
        isSelected: !!role,
        role: role?.role || 'Department User',
      };
    });

    const permsMap: Record<string, Partial<UserDepartmentPermissions>> = {};
    perms?.forEach(perm => {
      permsMap[perm.department_id] = perm;
    });

    setDepartmentSelections(selections);
    setPermissions(permsMap);
    setSiteRole(member.site_role || 'Contributor');
    setLoading(false);
  };

  const handleDepartmentToggle = (departmentId: string) => {
    setDepartmentSelections(prev => ({
      ...prev,
      [departmentId]: {
        ...prev[departmentId],
        isSelected: !prev[departmentId].isSelected,
      },
    }));

    if (!departmentSelections[departmentId]?.isSelected) {
      if (!permissions[departmentId]) {
        setPermissions(prev => ({
          ...prev,
          [departmentId]: {
            can_access_confidential: false,
            can_access_secret: false,
            can_access_top_secret: false,
            can_access_personal_data: false,
            can_manage_legal_hold: false,
            can_view_archived: false,
            can_view_confidential_archived: false,
            can_view_secret_archived: false,
            can_view_top_secret_archived: false,
          },
        }));
      }
    }
  };

  const handleDepartmentRoleChange = (departmentId: string, role: 'Department User' | 'Department Manager') => {
    setDepartmentSelections(prev => ({
      ...prev,
      [departmentId]: {
        ...prev[departmentId],
        role,
      },
    }));
  };

  const handlePermissionChange = (departmentId: string, permission: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [departmentId]: {
        ...prev[departmentId],
        [permission]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase
        .from('users')
        .update({ site_role: siteRole })
        .eq('id', member.id);

      await supabase
        .from('user_department_roles')
        .delete()
        .eq('user_id', member.id);

      const rolesToInsert: any[] = [];
      Object.entries(departmentSelections).forEach(([deptId, selection]) => {
        if (selection.isSelected) {
          rolesToInsert.push({
            user_id: member.id,
            department_id: deptId,
            role: selection.role,
          });
        }
      });

      if (rolesToInsert.length > 0) {
        await supabase
          .from('user_department_roles')
          .insert(rolesToInsert);
      }

      await supabase
        .from('user_department_permissions')
        .delete()
        .eq('user_id', member.id);

      const permsToInsert: any[] = [];
      Object.entries(permissions).forEach(([deptId, perm]) => {
        if (departmentSelections[deptId]?.isSelected) {
          permsToInsert.push({
            user_id: member.id,
            department_id: deptId,
            can_access_confidential: perm.can_access_confidential || false,
            can_access_secret: perm.can_access_secret || false,
            can_access_top_secret: perm.can_access_top_secret || false,
            can_access_personal_data: perm.can_access_personal_data || false,
            can_manage_legal_hold: perm.can_manage_legal_hold || false,
            can_view_archived: perm.can_view_archived || false,
            can_view_confidential_archived: perm.can_view_confidential_archived || false,
            can_view_secret_archived: perm.can_view_secret_archived || false,
            can_view_top_secret_archived: perm.can_view_top_secret_archived || false,
          });
        }
      });

      if (permsToInsert.length > 0) {
        await supabase
          .from('user_department_permissions')
          .insert(permsToInsert);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedDepartments = Object.entries(departmentSelections)
    .filter(([_, sel]) => sel.isSelected)
    .map(([deptId]) => deptId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            Manage Permissions - {member.full_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  1. Functional Scope - Primary Role
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Role
                  </label>
                  <select
                    value={siteRole}
                    onChange={(e) => setSiteRole(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SITE_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {siteRole === 'Permission Manager' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Permission Manager can only manage member permissions
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  2. Department Assignment
                </h3>
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <label className="relative inline-flex items-center cursor-pointer mt-1">
                          <input
                            type="checkbox"
                            checked={departmentSelections[dept.id]?.isSelected || false}
                            onChange={() => handleDepartmentToggle(dept.id)}
                            className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          />
                        </label>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{dept.name}</p>
                          {departmentSelections[dept.id]?.isSelected && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role per Department
                              </label>
                              <select
                                value={departmentSelections[dept.id]?.role || 'Department User'}
                                onChange={(e) => handleDepartmentRoleChange(dept.id, e.target.value as 'Department User' | 'Department Manager')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                              >
                                <option value="Department User">Department User</option>
                                <option value="Department Manager">Department Manager</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  3. Permission Configuration Per Department
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Department to Configure
                  </label>
                  <select
                    value={selectedConfigDepartment}
                    onChange={(e) => setSelectedConfigDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                    disabled={selectedDepartments.length === 0}
                  >
                    <option value="">-- Select a department --</option>
                    {selectedDepartments.map((deptId) => {
                      const dept = departments.find(d => d.id === deptId);
                      return (
                        <option key={deptId} value={deptId}>
                          {dept?.name}
                        </option>
                      );
                    })}
                  </select>

                  {selectedConfigDepartment && (
                    <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          a) Confidentiality Access
                        </p>
                        <div className="space-y-2">
                          {[
                            { key: 'can_access_confidential', label: 'Confidential' },
                            { key: 'can_access_secret', label: 'Secret' },
                            { key: 'can_access_top_secret', label: 'Top Secret' },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={permissions[selectedConfigDepartment]?.[key as keyof UserDepartmentPermissions] as boolean || false}
                                onChange={(e) => handlePermissionChange(selectedConfigDepartment, key, e.target.checked)}
                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                              />
                              <span className="text-sm text-gray-700">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          b) Access Permissions
                        </p>
                        <div className="space-y-2">
                          {[
                            { key: 'can_access_personal_data', label: 'Access Personal Data' },
                            { key: 'can_manage_legal_hold', label: 'Manage Legal Hold' },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={permissions[selectedConfigDepartment]?.[key as keyof UserDepartmentPermissions] as boolean || false}
                                onChange={(e) => handlePermissionChange(selectedConfigDepartment, key, e.target.checked)}
                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                              />
                              <span className="text-sm text-gray-700">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          c) Archived Content Access
                        </p>
                        <div className="space-y-2">
                          {[
                            { key: 'can_view_archived', label: 'View Archived' },
                            { key: 'can_view_confidential_archived', label: 'View Confidential Archived' },
                            { key: 'can_view_secret_archived', label: 'View Secret Archived' },
                            { key: 'can_view_top_secret_archived', label: 'View Top Secret Archived' },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={permissions[selectedConfigDepartment]?.[key as keyof UserDepartmentPermissions] as boolean || false}
                                onChange={(e) => handlePermissionChange(selectedConfigDepartment, key, e.target.checked)}
                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                              />
                              <span className="text-sm text-gray-700">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedDepartments.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      Please select at least one department in section 2 to configure permissions
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
}
