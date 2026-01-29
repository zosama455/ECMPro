/*
  # Add Document Permissions Management System

  ## Overview
  This migration implements a comprehensive document permissions management system
  that allows fine-grained control over document access and editing rights.

  ## New Tables

  ### `system_settings` Table
  Global application settings:
  - `id` (uuid, primary key) - Unique identifier
  - `setting_key` (text, unique) - Setting name
  - `setting_value` (jsonb) - Setting value
  - `description` (text) - Setting description
  - `updated_at` (timestamptz) - Last update timestamp

  ### `document_permissions` Table
  Document-level permissions for users and groups:
  - `id` (uuid, primary key) - Unique identifier
  - `file_id` (uuid, foreign key) - Document reference
  - `user_id` (uuid, foreign key) - User with permission (nullable)
  - `group_id` (uuid, foreign key) - Group with permission (nullable)
  - `role` (text) - Permission role (Consumer, Contributor, Editor, Collaborator, Coordinator)
  - `is_inherited` (boolean) - Whether permission is inherited from parent
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `permission_groups` Table
  Groups for permission management:
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Group name
  - `description` (text) - Group description
  - `department_id` (uuid, foreign key) - Department reference
  - `created_at` (timestamptz) - Creation timestamp

  ### `permission_group_members` Table
  Users belonging to permission groups:
  - `id` (uuid, primary key) - Unique identifier
  - `group_id` (uuid, foreign key) - Group reference
  - `user_id` (uuid, foreign key) - User reference
  - `created_at` (timestamptz) - Creation timestamp

  ## Modified Tables

  ### `files` Table - Add Permission Fields
  - `inherit_permissions` (boolean) - Whether to inherit permissions from folder
  - `can_manage_permissions` (boolean) - Whether current context allows permission management

  ### `users` Table - Add Permission Management Right
  - `can_manage_document_permissions` (boolean) - Permission to manage document permissions

  ## Security
  - RLS policies for all permission tables
  - Only users with manage permissions right can modify permissions
  - Users can view permissions for documents they have access to
*/

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Create permission_groups table
CREATE TABLE IF NOT EXISTS permission_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create permission_group_members table
CREATE TABLE IF NOT EXISTS permission_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES permission_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create document_permissions table
CREATE TABLE IF NOT EXISTS document_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES files(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES permission_groups(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('Consumer', 'Contributor', 'Editor', 'Collaborator', 'Coordinator')),
  is_inherited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (
    (user_id IS NOT NULL AND group_id IS NULL) OR
    (user_id IS NULL AND group_id IS NOT NULL)
  )
);

-- Add permission fields to files table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'inherit_permissions') THEN
    ALTER TABLE files ADD COLUMN inherit_permissions boolean DEFAULT true;
  END IF;
END $$;

-- Add permission management right to users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'can_manage_document_permissions') THEN
    ALTER TABLE users ADD COLUMN can_manage_document_permissions boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_permissions_file_id ON document_permissions(file_id);
CREATE INDEX IF NOT EXISTS idx_document_permissions_user_id ON document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_permissions_group_id ON document_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_permission_group_members_group_id ON permission_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_permission_group_members_user_id ON permission_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Enable RLS on all permission tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage system settings
CREATE POLICY "Admins can manage system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Users can view permission groups in their department
CREATE POLICY "Users can view permission groups in their department"
  ON permission_groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM department_members dm
      WHERE dm.department_id = permission_groups.department_id
      AND dm.user_id = auth.uid()
    )
  );

-- RLS Policy: Managers can manage permission groups
CREATE POLICY "Managers can manage permission groups"
  ON permission_groups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      INNER JOIN department_members dm ON dm.user_id = u.id
      WHERE u.id = auth.uid()
      AND dm.department_id = permission_groups.department_id
      AND (u.site_department_manager = true OR u.role = 'admin')
    )
  );

-- RLS Policy: Users can view group members
CREATE POLICY "Users can view group members"
  ON permission_group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM permission_groups pg
      INNER JOIN department_members dm ON dm.department_id = pg.department_id
      WHERE pg.id = permission_group_members.group_id
      AND dm.user_id = auth.uid()
    )
  );

-- RLS Policy: Managers can manage group members
CREATE POLICY "Managers can manage group members"
  ON permission_group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM permission_groups pg
      INNER JOIN users u ON u.id = auth.uid()
      INNER JOIN department_members dm ON dm.user_id = u.id AND dm.department_id = pg.department_id
      WHERE pg.id = permission_group_members.group_id
      AND (u.site_department_manager = true OR u.role = 'admin')
    )
  );

-- RLS Policy: Users can view document permissions for their documents
CREATE POLICY "Users can view document permissions"
  ON document_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM files f
      INNER JOIN department_members dm ON dm.department_id = f.department_id
      WHERE f.id = document_permissions.file_id
      AND dm.user_id = auth.uid()
    )
  );

-- RLS Policy: Users with manage permission can modify document permissions
CREATE POLICY "Users with manage permission can modify document permissions"
  ON document_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.can_manage_document_permissions = true
    )
  );

-- Insert default system setting for permissions feature
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES (
  'enable_document_permissions_screen',
  '{"enabled": false}'::jsonb,
  'Enable or disable the document permissions management screen'
)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample permission groups for each department
INSERT INTO permission_groups (name, description, department_id)
SELECT 
  'Viewers',
  'Users who can only view documents',
  d.id
FROM departments d
ON CONFLICT DO NOTHING;

INSERT INTO permission_groups (name, description, department_id)
SELECT 
  'Editors',
  'Users who can view and edit documents',
  d.id
FROM departments d
ON CONFLICT DO NOTHING;

INSERT INTO permission_groups (name, description, department_id)
SELECT 
  'Administrators',
  'Users with full document management rights',
  d.id
FROM departments d
ON CONFLICT DO NOTHING;

-- Function to update document_permissions timestamp
CREATE OR REPLACE FUNCTION update_document_permission_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_document_permissions_timestamp ON document_permissions;
CREATE TRIGGER update_document_permissions_timestamp
  BEFORE UPDATE ON document_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_document_permission_timestamp();

-- Function to update system_settings timestamp
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_system_settings_timestamp ON system_settings;
CREATE TRIGGER update_system_settings_timestamp
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_timestamp();
