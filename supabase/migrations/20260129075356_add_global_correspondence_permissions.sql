/*
  # Add Global Correspondence Permissions System

  ## Overview
  This migration adds system-wide correspondence permissions for users,
  allowing fine-grained control over correspondence management actions.

  ## New Tables

  ### `user_global_permissions` Table
  System-wide correspondence permissions for users:
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - User reference (unique)
  - `can_create_correspondence` (boolean) - Can create correspondence
  - `can_edit_correspondence` (boolean) - Can edit correspondence
  - `can_delete_correspondence` (boolean) - Can delete correspondence
  - `can_forward_correspondence` (boolean) - Can forward correspondence
  - `can_review_activity_log` (boolean) - Can review activity logs
  - `can_create_announcement` (boolean) - Can create announcements
  - `can_archive_message` (boolean) - Can archive messages
  - `can_view_dashboard` (boolean) - Can view dashboard
  - `can_manage_archived_messages` (boolean) - Can manage archived messages
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS policies for the new table
  - Only admins and permission managers can modify global permissions
  - Users can view their own global permissions
*/

-- Create user_global_permissions table
CREATE TABLE IF NOT EXISTS user_global_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  can_create_correspondence boolean DEFAULT false,
  can_edit_correspondence boolean DEFAULT false,
  can_delete_correspondence boolean DEFAULT false,
  can_forward_correspondence boolean DEFAULT false,
  can_review_activity_log boolean DEFAULT false,
  can_create_announcement boolean DEFAULT false,
  can_archive_message boolean DEFAULT false,
  can_view_dashboard boolean DEFAULT true,
  can_manage_archived_messages boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_global_permissions_user_id ON user_global_permissions(user_id);

-- Enable RLS
ALTER TABLE user_global_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins and permission managers can view all global permissions
CREATE POLICY "Admins and permission managers can view all global permissions"
  ON user_global_permissions
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

-- RLS Policy: Admins and permission managers can manage global permissions
CREATE POLICY "Admins and permission managers can manage global permissions"
  ON user_global_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.site_role = 'Permission Manager')
    )
  );

-- Function to update user_global_permissions timestamp
CREATE OR REPLACE FUNCTION update_user_global_permissions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_global_permissions_timestamp ON user_global_permissions;
CREATE TRIGGER update_user_global_permissions_timestamp
  BEFORE UPDATE ON user_global_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_global_permissions_timestamp();

-- Create default global permissions for existing users with view dashboard enabled by default
INSERT INTO user_global_permissions (user_id, can_view_dashboard)
SELECT id, true FROM users
WHERE id NOT IN (SELECT user_id FROM user_global_permissions)
ON CONFLICT (user_id) DO NOTHING;
