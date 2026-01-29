/*
  # Add Public Read Policy for Users Table

  ## Overview
  Adds permissive read policy to allow viewing users during development without authentication.
  This policy should be removed or restricted in production.

  ## Changes
  1. Users Table
    - Add policy to allow public read access for development testing

  ## Security Notes
  - This is a DEVELOPMENT ONLY policy
  - Remove this policy before production deployment
  - Write operations still require authentication
*/

-- Allow public read access to users
CREATE POLICY "Public read access for users"
  ON users FOR SELECT
  TO public
  USING (true);
