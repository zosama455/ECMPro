/*
  # Add Sample Users for Testing

  ## Overview
  Creates sample auth users and corresponding public.users entries for testing the Settings > Team Members page.

  ## 1. New Data
  - 5 sample users with different roles
    - 1 admin user (John Admin)
    - 1 permission manager (Jane Manager)
    - 3 regular users with different site roles

  ## 2. Important Notes
  - Creates both auth.users and public.users entries
  - All users belong to Acme Corporation
  - Uses default passwords for testing (not recommended for production)
  - Site roles include: Site Manager, Permission Manager, Contributor, Consumer, Collaborator
*/

-- Create sample auth users first
-- Note: In a real setup, users would sign up through the application
-- For testing, we're inserting directly into auth.users

DO $$
DECLARE
  user1_id uuid := '22222222-2222-2222-2222-222222222221';
  user2_id uuid := '22222222-2222-2222-2222-222222222222';
  user3_id uuid := '22222222-2222-2222-2222-222222222223';
  user4_id uuid := '22222222-2222-2222-2222-222222222224';
  user5_id uuid := '22222222-2222-2222-2222-222222222225';
  company_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
  VALUES
    (user1_id, '00000000-0000-0000-0000-000000000000', 'admin@acme.com', crypt('TestPassword123!', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
    (user2_id, '00000000-0000-0000-0000-000000000000', 'jane.manager@acme.com', crypt('TestPassword123!', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
    (user3_id, '00000000-0000-0000-0000-000000000000', 'bob.user@acme.com', crypt('TestPassword123!', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
    (user4_id, '00000000-0000-0000-0000-000000000000', 'alice.user@acme.com', crypt('TestPassword123!', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
    (user5_id, '00000000-0000-0000-0000-000000000000', 'charlie.user@acme.com', crypt('TestPassword123!', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- Insert into public.users
  INSERT INTO users (id, email, full_name, role, company_id, site_role)
  VALUES
    (user1_id, 'admin@acme.com', 'John Admin', 'admin', company_id, 'Site Manager'),
    (user2_id, 'jane.manager@acme.com', 'Jane Manager', 'user', company_id, 'Permission Manager'),
    (user3_id, 'bob.user@acme.com', 'Bob Smith', 'user', company_id, 'Contributor'),
    (user4_id, 'alice.user@acme.com', 'Alice Johnson', 'user', company_id, 'Consumer'),
    (user5_id, 'charlie.user@acme.com', 'Charlie Brown', 'user', company_id, 'Collaborator')
  ON CONFLICT (id) DO NOTHING;
END $$;
