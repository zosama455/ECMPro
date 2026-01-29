export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  created_at: string;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  company_id: string;
  created_at: string;
  site_department_manager?: boolean;
  can_manage_dept_tasks?: boolean;
  security_clearance?: string;
  can_access_archived_docs?: boolean;
  can_access_logs?: boolean;
  can_read_confidential_docs?: boolean;
  can_read_secret_docs?: boolean;
  can_read_top_secret_docs?: boolean;
  can_change_edit_archived_docs_status?: boolean;
  can_manage_document_permissions?: boolean;
  site_role?: 'Site Manager' | 'Permission Manager' | 'Contributor' | 'Consumer' | 'Collaborator';
}

export interface UserDepartmentRole {
  id: string;
  user_id: string;
  department_id: string;
  role: 'Department User' | 'Department Manager';
  created_at: string;
  updated_at: string;
}

export interface UserDepartmentPermissions {
  id: string;
  user_id: string;
  department_id: string;
  can_access_confidential: boolean;
  can_access_secret: boolean;
  can_access_top_secret: boolean;
  can_access_personal_data: boolean;
  can_manage_legal_hold: boolean;
  can_view_archived: boolean;
  can_view_confidential_archived: boolean;
  can_view_secret_archived: boolean;
  can_view_top_secret_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentMember {
  id: string;
  user_id: string;
  department_id: string;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  department_id: string;
  created_by?: string;
  created_at: string;
  is_leaf?: boolean;
}

export interface File {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  folder_id?: string;
  department_id: string;
  uploaded_by?: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  confidentiality: 'public' | 'internal' | 'confidential' | 'restricted' | 'secret' | 'top_secret';
  tags: string[];
  created_at: string;
  modified_at: string;
  assignees?: string[];
}

export interface RecentActivity {
  id: string;
  user_id: string;
  department_id: string;
  activity_type: 'upload' | 'download' | 'edit' | 'delete' | 'share' | 'create_folder';
  entity_type: 'file' | 'folder';
  entity_id: string;
  entity_name: string;
  description: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  department_id: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'active' | 'pending_review' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_by?: string;
  created_at: string;
  completed_at?: string;
  workflow_type?: string;
  started_at?: string;
  confidentiality_level?: string;
}

export interface AppContextType {
  user: User | null;
  company: Company | null;
  departments: Department[];
  currentDepartment: Department | null;
  setCurrentDepartment: (department: Department) => void;
  isLoading: boolean;
}
