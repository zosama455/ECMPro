/*
  # Add Enhanced Member Permissions System

  ## Overview
  This migration enhances the member permissions management system to support
  fine-grained department-level permissions and role assignments.

  ## New Tables

  ### `user_department_roles` Table
  Department-specific role assignments for users:
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - User reference
  - `department_id` (uuid, foreign key) - Department reference
  - `role` (text) - Department role (Department User, Department Manager)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `user_department_permissions` Table
  Department-specific permissions for users:
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - User reference
  - `department_id` (uuid, foreign key) - Department reference
  - `can_access_confidential` (boolean) - Access to confidential documents
  - `can_access_secret` (boolean) - Access to secret documents
  - `can_access_top_secret` (boolean) - Access to top secret documents
  - `can_access_personal_data` (boolean) - Access to personal data
  - `can_manage_legal_hold` (boolean) - Manage legal hold
  - `can_view_archived` (boolean) - View archived content
  - `can_view_confidential_archived` (boolean) - View confidential archived
  - `can_view_secret_archived` (boolean) - View secret archived
  - `can_view_top_secret_archived` (boolean) - View top secret archived
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Modified Tables

  ### `users` Table - Add Site Role Field
  - `site_role` (text) - Site-wide role (Site Manager, Permission Manager, Contributor, Consumer, Collaborator)

  ## Security
  - RLS policies for all new tables
  - Only admins and permission managers can modify member permissions
  - Users can view their own permissions
*/

-- Add site_role to users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'site_role') THEN
    ALTER TABLE users ADD COLUMN site_role text DEFAULT 'Contributor' 
      CHECK (site_role IN ('Site Manager', 'Permission Manager', 'Contributor', 'Consumer', 'Collaborator'));
  END IF;
END $$;

-- Create user_department_roles table
CREATE TABLE IF NOT EXISTS user_department_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('Department User', 'Department Manager')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, department_id)
);

-- Create user_department_permissions table
CREATE TABLE IF NOT EXISTS user_department_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
  can_access_confidential boolean DEFAULT false,
  can_access_secret boolean DEFAULT false,
  can_access_top_secret boolean DEFAULT false,
  can_access_personal_data boolean DEFAULT false,
  can_manage_legal_hold boolean DEFAULT false,
  can_view_archived boolean DEFAULT false,
  can_view_confidential_archived boolean DEFAULT false,
  can_view_secret_archived boolean DEFAULT false,
  can_view_top_secret_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, department_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_department_roles_user_id ON user_department_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_department_roles_department_id ON user_department_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_department_permissions_user_id ON user_department_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_department_permissions_department_id ON user_department_permissions(department_id);

-- Enable RLS
ALTER TABLE user_department_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_department_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins and permission managers can view all department roles
CREATE POLICY "Admins and permission managers can view all department roles"
  ON user_department_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.site_role = 'Permission Manager')
    )
    OR user_id = auth.uid()
  );

-- RLS Policy: Admins and permission managers can manage department roles
CREATE POLICY "Admins and permission managers can manage department roles"
  ON user_department_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.site_role = 'Permission Manager')
    )
  );

-- RLS Policy: Admins and permission managers can view all department permissions
CREATE POLICY "Admins and permission managers can view all department permissions"
  ON user_department_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.site_role = 'Permission Manager')
    )
    OR user_id = auth.uid()
  );

-- RLS Policy: Admins and permission managers can manage department permissions
CREATE POLICY "Admins and permission managers can manage department permissions"
  ON user_department_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.site_role = 'Permission Manager')
    )
  );

-- Function to update user_department_roles timestamp
CREATE OR REPLACE FUNCTION update_user_department_roles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_department_roles_timestamp ON user_department_roles;
CREATE TRIGGER update_user_department_roles_timestamp
  BEFORE UPDATE ON user_department_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_department_roles_timestamp();

-- Function to update user_department_permissions timestamp
CREATE OR REPLACE FUNCTION update_user_department_permissions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_department_permissions_timestamp ON user_department_permissions;
CREATE TRIGGER update_user_department_permissions_timestamp
  BEFORE UPDATE ON user_department_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_department_permissions_timestamp();

-- Update existing users to have default site_role if null
UPDATE users SET site_role = 'Contributor' WHERE site_role IS NULL;

-- Set admins to Site Manager role
UPDATE users SET site_role = 'Site Manager' WHERE role = 'admin';
