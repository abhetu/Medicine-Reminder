# Medicine Reminder Web App

A comprehensive medicine reminder application that allows users (typically children abroad) to set up medication schedules for their parents. Parents receive automated email reminders at scheduled times without needing to create an account.

## 🎯 Features

### Core Functionality
- **User Authentication**: Secure login/signup with Supabase Auth
- **Recipient Management**: Add parent profiles with name, email, phone, and timezone
- **Medication Scheduling**: Set up medications with dosage, frequency, and custom times
- **Automated Reminders**: Send email reminders at scheduled times
- **Reminder History**: Track all sent reminders with status and timestamps
- **Dashboard Analytics**: View statistics on recipients, medications, and reminders

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Database**: PostgreSQL with Row Level Security
- **Hosting**: Ready for Netlify/Vercel deployment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase account
- Email service account (Resend recommended for production)

### 1. Clone and Install

```bash
git clone <repository-url>
cd medicine-reminder-app
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In your Supabase dashboard, go to Settings → API
3. Copy your project URL and anon key

### 3. Environment Configuration

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database Setup

1. In your Supabase dashboard, go to SQL Editor
2. Copy and run the migration script from `supabase/migrations/create_medicine_reminder_schema.sql`
3. This will create all necessary tables, RLS policies, and functions

### 5. Edge Functions Setup

1. In Supabase dashboard, go to Edge Functions
2. Create two new functions:
   - `send-reminder`: Copy code from `supabase/functions/send-reminder/index.ts`
   - `schedule-reminders`: Copy code from `supabase/functions/schedule-reminders/index.ts`

### 6. Email Service Configuration (Production)

For production, configure an email service in your edge functions:

**Option A: Resend (Recommended)**
```typescript
// In send-reminder function, uncomment and configure:
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Medicine Reminder <noreply@yourdomain.com>',
    to: recipientEmail,
    subject: emailSubject,
    html: emailContent,
  }),
});
```

**Option B: SendGrid**
```typescript
// Configure SendGrid API in your edge function
```

### 7. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.




### Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   └── dashboard/      # Dashboard components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component

supabase/
├── migrations/         # Database migration files
└── functions/         # Edge function implementations
```
