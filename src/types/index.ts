export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Recipient {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  timezone: string;
  created_at: string;
}

export interface Medication {
  id: string;
  recipient_id: string;
  name: string;
  dosage: string;
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'custom';
  times: string[]; // Array of times like ["08:00", "20:00"]
  start_date: string;
  end_date: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface ReminderLog {
  id: string;
  medication_id: string;
  recipient_id: string;
  scheduled_time: string;
  sent_time: string;
  method: 'email' | 'sms';
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  created_at: string;
}

export interface DashboardStats {
  totalRecipients: number;
  totalMedications: number;
  remindersToday: number;
  remindersSent: number;
  remindersSuccess: number;
}