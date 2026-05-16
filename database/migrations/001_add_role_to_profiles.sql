-- Migration: Add role column to profiles table
-- Run this in Supabase SQL Editor if your database was created before this migration

BEGIN;

-- Add role column with default 'client'
ALTER TABLE public.profiles
ADD COLUMN role text NOT NULL DEFAULT 'client';

-- Add constraint to only allow 'admin' or 'client'
ALTER TABLE public.profiles
ADD CONSTRAINT check_role_value CHECK (role IN ('admin', 'client'));

-- Set your admin user's role
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@example.com';

COMMIT;
