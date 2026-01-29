import { useState, useEffect } from 'react';
import {
  ChevronRight,
  Shield,
  UserPlus,
  Trash2,
  Save,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  User,
  Users as UsersIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';

interface Permission {
  id: string;
  user_id?: string;
  group_id?: string;
  role: string;
  is_inherited: boolean;
  user?: { id: string; full_name: string; email: string };
  group?: { id: string; name: string; description: string };
}

interface UserOrGroup {
  id: string;
  name: string;
  type: 'user' | 'group';
  email?: string;
}

const ROLES = ['Consumer', 'Contributor', 'Editor', 'Collaborator', 'Coordinator'];

export function DocumentPermissions() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { user, currentDepartment } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [folderPath, setFolderPath] = useState<string[]>([]);
  const [inheritPermissions, setInheritPermissions] = useState(true);
  const [inheritedPermissions, setInheritedPermissions] = useState<Permission[]>([]);
  const [localPermissions, setLocalPermissions] = useState<Permission[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserOrGroup[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<UserOrGroup | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('Consumer');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const canManagePermissions = user?.can_manage_document_permissions || false;

  useEffect(() => {
    if (fileId && currentDepartment) {
      loadDocumentData();
      loadPermissions();
    }
  }, [fileId, currentDepartment]);

  const loadDocumentData = async () => {
    if (!fileId) return;

    const { data: fileData } = await supabase
      .from('files')
      .select('name, inherit_permissions, folder_id')
      .eq('id', fileId)
      .maybeSingle();

    if (fileData) {
      setDocumentName(fileData.name);
      setInheritPermissions(fileData.inherit_permissions ?? true);

      if (fileData.folder_id) {
        await loadFolderPath(fileData.folder_id);
      }
    }
  };

  const loadFolderPath = async (folderId: string) => {
    const path: string[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const { data } = await supabase
        .from('folders')
        .select('name, parent_id')
        .eq('id', currentId)
        .maybeSingle();

      if (data) {
        path.unshift(data.name);
        currentId = data.parent_id;
      } else {
        break;
      }
    }

    setFolderPath(path);
  };

  const loadPermissions = async () => {
    if (!fileId) return;

    setLoading(true);

    const { data: inherited } = await supabase
      .from('document_permissions')
      .select(`
        *,
        user:users(id, full_name, email),
        group:permission_groups(id, name, description)
      `)
      .eq('file_id', fileId)
      .eq('is_inherited', true);

    const { data: local } = await supabase
      .from('document_permissions')
      .select(`
        *,
        user:users(id, full_name, email),
        group:permission_groups(id, name, description)
      `)
      .eq('file_id', fileId)
      .eq('is_inherited', false);

    setInheritedPermissions(inherited || []);
    setLocalPermissions(local || []);
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    if (!currentDepartment) return;

    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, email')
      .ilike('full_name', `%${query}%`)
      .limit(10);

    const { data: groups } = await supabase
      .from('permission_groups')
      .select('id, name, description')
      .eq('department_id', currentDepartment.id)
      .ilike('name', `%${query}%`)
      .limit(10);

    const results: UserOrGroup[] = [
      ...(users || []).map(u => ({ id: u.id, name: u.full_name, email: u.email, type: 'user' as const })),
      ...(groups || []).map(g => ({ id: g.id, name: g.name, type: 'group' as const })),
    ];

    setSearchResults(results);
  };

  const handleAddPermission = async () => {
    if (!selectedEntity || !fileId) return;

    setSaving(true);
    try {
      const permission: any = {
        file_id: fileId,
        role: selectedRole,
        is_inherited: false,
      };

      if (selectedEntity.type === 'user') {
        permission.user_id = selectedEntity.id;
      } else {
        permission.group_id = selectedEntity.id;
      }

      const { error } = await supabase
        .from('document_permissions')
        .insert([permission]);

      if (!error) {
        showToast('Permission added successfully', 'success');
        setShowAddModal(false);
        setSelectedEntity(null);
        setSearchQuery('');
        setSearchResults([]);
        await loadPermissions();
      } else {
        showToast('Failed to add permission', 'error');
      }
    } catch (err) {
      showToast('Failed to add permission', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('document_permissions')
        .delete()
        .eq('id', permissionId);

      if (!error) {
        showToast('Permission removed successfully', 'success');
        await loadPermissions();
      } else {
        showToast('Failed to remove permission', 'error');
      }
    } catch (err) {
      showToast('Failed to remove permission', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (permissionId: string, newRole: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('document_permissions')
        .update({ role: newRole })
        .eq('id', permissionId);

      if (!error) {
        showToast('Permission updated successfully', 'success');
        await loadPermissions();
      } else {
        showToast('Failed to update permission', 'error');
      }
    } catch (err) {
      showToast('Failed to update permission', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!fileId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({ inherit_permissions: inheritPermissions })
        .eq('id', fileId);

      if (!error) {
        showToast('Settings saved successfully', 'success');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Permissions – {documentName}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Repository</span>
            {folderPath.map((folder, index) => (
              <span key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <span>{folder}</span>
              </span>
            ))}
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{documentName}</span>
          </div>
        </div>

        {canManagePermissions && (
          <div className="mb-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium text-gray-900">Inherit Permissions</p>
                <p className="text-sm text-gray-500">Use permissions from parent folder</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={inheritPermissions}
                  onChange={(e) => setInheritPermissions(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={inheritPermissions}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              Add User/Group
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Inherited Permissions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users and Groups
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : inheritedPermissions.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                        No inherited permissions
                      </td>
                    </tr>
                  ) : (
                    inheritedPermissions.map((perm) => (
                      <tr key={perm.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {perm.user ? (
                              <>
                                <User className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{perm.user.full_name}</p>
                                  <p className="text-xs text-gray-500">{perm.user.email}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <UsersIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{perm.group?.name}</p>
                                  {perm.group?.description && (
                                    <p className="text-xs text-gray-500">{perm.group.description}</p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {perm.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Locally Set Permissions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users and Groups
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    {canManagePermissions && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={canManagePermissions ? 3 : 2} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : localPermissions.length === 0 ? (
                    <tr>
                      <td colSpan={canManagePermissions ? 3 : 2} className="px-6 py-8 text-center text-gray-500">
                        No local permissions
                      </td>
                    </tr>
                  ) : (
                    localPermissions.map((perm) => (
                      <tr key={perm.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {perm.user ? (
                              <>
                                <User className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{perm.user.full_name}</p>
                                  <p className="text-xs text-gray-500">{perm.user.email}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <UsersIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{perm.group?.name}</p>
                                  {perm.group?.description && (
                                    <p className="text-xs text-gray-500">{perm.group.description}</p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {canManagePermissions && !inheritPermissions ? (
                            <select
                              value={perm.role}
                              onChange={(e) => handleUpdateRole(perm.id, e.target.value)}
                              disabled={saving}
                              className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              {ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {perm.role}
                            </span>
                          )}
                        </td>
                        {canManagePermissions && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleRemovePermission(perm.id)}
                              disabled={inheritPermissions || saving}
                              className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>

        {canManagePermissions && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add User/Group</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedEntity(null);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Users/Groups
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Type to search..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => {
                            setSelectedEntity(result);
                            setSearchResults([]);
                            setSearchQuery(result.name);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {result.type === 'user' ? (
                              <User className="w-5 h-5 text-gray-400" />
                            ) : (
                              <UsersIcon className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{result.name}</p>
                              {result.email && (
                                <p className="text-xs text-gray-500">{result.email}</p>
                              )}
                              <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedEntity && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-900">
                      Selected: <span className="font-medium">{selectedEntity.name}</span>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedEntity(null);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPermission}
                  disabled={!selectedEntity || saving}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
                toast.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
