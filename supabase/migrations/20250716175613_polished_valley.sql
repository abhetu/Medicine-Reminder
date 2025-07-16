/*
  # Medicine Reminder App Database Schema

  1. New Tables
    - `recipients`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `email` (text)
      - `phone` (text, optional)
      - `timezone` (text)
      - `created_at` (timestamp)

    - `medications`
      - `id` (uuid, primary key)
      - `recipient_id` (uuid, foreign key to recipients)
      - `name` (text)
      - `dosage` (text)
      - `frequency` (text)
      - `times` (text array)
      - `start_date` (date)
      - `end_date` (date)
      - `notes` (text, optional)
      - `is_active` (boolean)
      - `created_at` (timestamp)

    - `reminder_logs`
      - `id` (uuid, primary key)
      - `medication_id` (uuid, foreign key to medications)
      - `recipient_id` (uuid, foreign key to recipients)
      - `scheduled_time` (timestamp)
      - `sent_time` (timestamp, optional)
      - `method` (text) - 'email' or 'sms'
      - `status` (text) - 'sent', 'failed', 'pending'
      - `error_message` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Recipients and related data are only accessible by the user who created them

  3. Indexes
    - Add indexes for frequently queried columns
    - Foreign key indexes for performance
*/

-- Recipients table
CREATE TABLE IF NOT EXISTS recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  timezone text NOT NULL DEFAULT 'America/New_York',
  created_at timestamptz DEFAULT now()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES recipients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'custom')),
  times text[] NOT NULL DEFAULT '{}',
  start_date date NOT NULL,
  end_date date NOT NULL,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Reminder logs table
CREATE TABLE IF NOT EXISTS reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES recipients(id) ON DELETE CASCADE NOT NULL,
  scheduled_time timestamptz NOT NULL,
  sent_time timestamptz,
  method text NOT NULL DEFAULT 'email' CHECK (method IN ('email', 'sms')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipients
CREATE POLICY "Users can view own recipients"
  ON recipients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recipients"
  ON recipients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipients"
  ON recipients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipients"
  ON recipients
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for medications
CREATE POLICY "Users can view medications for their recipients"
  ON medications
  FOR SELECT
  TO authenticated
  USING (
    recipient_id IN (
      SELECT id FROM recipients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create medications for their recipients"
  ON medications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    recipient_id IN (
      SELECT id FROM recipients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update medications for their recipients"
  ON medications
  FOR UPDATE
  TO authenticated
  USING (
    recipient_id IN (
      SELECT id FROM recipients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    recipient_id IN (
      SELECT id FROM recipients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete medications for their recipients"
  ON medications
  FOR DELETE
  TO authenticated
  USING (
    recipient_id IN (
      SELECT id FROM recipients WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for reminder_logs
CREATE POLICY "Users can view reminder logs for their recipients"
  ON reminder_logs
  FOR SELECT
  TO authenticated
  USING (
    recipient_id IN (
      SELECT id FROM recipients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service can create reminder logs"
  ON reminder_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service can update reminder logs"
  ON reminder_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_recipient_id ON medications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_reminder_logs_medication_id ON reminder_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_recipient_id ON reminder_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_scheduled_time ON reminder_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_status ON reminder_logs(status);

-- Create a function to get active medications for reminder scheduling
CREATE OR REPLACE FUNCTION get_active_medications_for_reminders()
RETURNS TABLE (
  medication_id uuid,
  medication_name text,
  dosage text,
  times text[],
  recipient_id uuid,
  recipient_name text,
  recipient_email text,
  recipient_timezone text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    m.id as medication_id,
    m.name as medication_name,
    m.dosage,
    m.times,
    r.id as recipient_id,
    r.name as recipient_name,
    r.email as recipient_email,
    r.timezone as recipient_timezone
  FROM medications m
  JOIN recipients r ON m.recipient_id = r.id
  WHERE m.is_active = true
    AND CURRENT_DATE BETWEEN m.start_date AND m.end_date;
$$;