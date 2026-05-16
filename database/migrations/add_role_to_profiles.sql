-- Migration: Add role column to profiles table

-- Add role column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'client' 
CHECK (role in ('admin', 'client'));

-- Create an index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Add a comment to the column
COMMENT ON COLUMN public.profiles.role IS 'User role: admin or client';
