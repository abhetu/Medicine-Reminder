import { supabase } from './supabase';
import { Recipient, Medication, ReminderLog, DashboardStats } from '../types';

// Recipients
export const getRecipients = async (userId: string): Promise<Recipient[]> => {
  const { data, error } = await supabase
    .from('recipients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createRecipient = async (recipient: Omit<Recipient, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('recipients')
    .insert([recipient])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateRecipient = async (id: string, updates: Partial<Recipient>) => {
  const { data, error } = await supabase
    .from('recipients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteRecipient = async (id: string) => {
  const { error } = await supabase
    .from('recipients')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Medications
export const getMedications = async (recipientId?: string): Promise<Medication[]> => {
  let query = supabase
    .from('medications')
    .select(`
      *,
      recipients(name, email)
    `)
    .order('created_at', { ascending: false });

  if (recipientId) {
    query = query.eq('recipient_id', recipientId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const createMedication = async (medication: Omit<Medication, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('medications')
    .insert([medication])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMedication = async (id: string, updates: Partial<Medication>) => {
  const { data, error } = await supabase
    .from('medications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMedication = async (id: string) => {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Reminder Logs
export const getReminderLogs = async (limit = 50): Promise<ReminderLog[]> => {
  const { data, error } = await supabase
    .from('reminder_logs')
    .select(`
      *,
      medications(name),
      recipients(name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const createReminderLog = async (log: Omit<ReminderLog, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('reminder_logs')
    .insert([log])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Dashboard Stats
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  // Get total recipients
  const { count: totalRecipients } = await supabase
    .from('recipients')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get total active medications
  const { count: totalMedications } = await supabase
    .from('medications')
    .select('*, recipients!inner(*)', { count: 'exact', head: true })
    .eq('recipients.user_id', userId)
    .eq('is_active', true);

  // Get today's reminder logs
  const today = new Date().toISOString().split('T')[0];
  const { count: remindersToday } = await supabase
    .from('reminder_logs')
    .select('*, recipients!inner(*)', { count: 'exact', head: true })
    .eq('recipients.user_id', userId)
    .gte('scheduled_time', `${today}T00:00:00`)
    .lt('scheduled_time', `${today}T23:59:59`);

  // Get sent reminders today
  const { count: remindersSent } = await supabase
    .from('reminder_logs')
    .select('*, recipients!inner(*)', { count: 'exact', head: true })
    .eq('recipients.user_id', userId)
    .eq('status', 'sent')
    .gte('sent_time', `${today}T00:00:00`);

  return {
    totalRecipients: totalRecipients || 0,
    totalMedications: totalMedications || 0,
    remindersToday: remindersToday || 0,
    remindersSent: remindersSent || 0,
    remindersSuccess: remindersSent || 0,
  };
};