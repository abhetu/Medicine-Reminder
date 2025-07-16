# Medicine Reminder Web App

A comprehensive medicine reminder application that allows users (typically children abroad) to set up medication schedules for their parents. The parents receive automated email reminders at scheduled times without needing to create accounts.

## 🎯 Features

### Core Functionality
- **User Authentication**: Secure login/signup with Supabase Auth
- **Recipient Management**: Add parent profiles with name, email, phone, and timezone
- **Medication Scheduling**: Set up medications with dosage, frequency, and custom times
- **Automated Reminders**: Send email reminders at scheduled times
- **Reminder History**: Track all sent reminders with status and timestamps
- **Dashboard Analytics**: View statistics on recipients, medications, and reminders

### Design & User Experience
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Modern UI**: Clean, healthcare-inspired design with intuitive navigation
- **Real-time Updates**: Live dashboard updates with seamless data synchronization
- **Accessibility**: Proper contrast ratios and accessible form controls

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Database**: PostgreSQL with Row Level Security
- **Email Service**: Supabase Edge Functions (configurable with Resend, SendGrid, etc.)
- **Hosting**: Ready for Netlify/Vercel deployment
- **State Management**: React Hooks + React Hook Form
- **Validation**: Yup schema validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

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

## 📱 Usage Guide

### For the Child (App User)

1. **Sign Up/Login**: Create an account with your email and password
2. **Add Recipients**: Add your parent's information including their timezone
3. **Create Medications**: Set up medication schedules with:
   - Medication name and dosage
   - Frequency (once daily, twice daily, etc., or custom)
   - Reminder times
   - Start and end dates
   - Optional notes
4. **Monitor**: View reminder history and statistics in the dashboard

### For the Parent (Recipient)

- **No account needed**: Parents simply receive email reminders
- **Clear instructions**: Each email contains medication details and timing
- **Professional formatting**: Healthcare-appropriate email design

## 🔒 Security Features

- **Row Level Security**: All data is protected with Supabase RLS
- **User Isolation**: Users can only access their own recipients and medications
- **Secure Authentication**: Supabase handles password hashing and session management
- **Environment Variables**: Sensitive keys stored securely

## 📊 Database Schema

### Tables

1. **Recipients**: Store parent information and timezone
2. **Medications**: Store medication details and schedules
3. **Reminder Logs**: Track all reminder attempts and their status

### Key Features

- **Cascade Deletes**: Removing a recipient removes all related data
- **Timezone Support**: Reminders sent in recipient's local time
- **Flexible Scheduling**: Support for multiple daily doses and custom times
- **Audit Trail**: Complete history of all reminder attempts

## 🛠️ Customization

### Adding SMS Support

1. Sign up for Twilio
2. Add Twilio credentials to your environment
3. Modify the `send-reminder` function to include SMS logic
4. Update the UI to show SMS as an option

### Adding More Email Providers

1. Create a new configuration in the edge function
2. Add the provider's API integration
3. Update environment variables accordingly

### Extending Medication Types

1. Modify the `medications` table schema
2. Update the TypeScript types
3. Enhance the UI forms accordingly

## 🚀 Deployment

### Option 1: Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy

### Option 2: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard
4. Deploy

### Production Checklist

- [ ] Configure proper email service (Resend/SendGrid)
- [ ] Set up monitoring for edge functions
- [ ] Configure proper domain for email sending
- [ ] Set up backup/recovery procedures
- [ ] Test timezone handling across different regions
- [ ] Set up cron job for automated reminder processing

## 🔧 Development

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

### Key Components

- **AuthForm**: Handles user registration and login
- **Dashboard**: Main application interface with tabs
- **RecipientManager**: CRUD operations for recipients
- **MedicationManager**: CRUD operations for medications
- **ReminderHistory**: Display and filter reminder logs

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please:
1. Check the GitHub issues
2. Review the Supabase documentation
3. Create a new issue with detailed information

## 🔮 Future Enhancements

- **Mobile App**: React Native version for iOS/Android
- **Video Call Reminders**: Integration with video calling services
- **Medication Tracking**: Photo confirmation of medication taken
- **Doctor Integration**: Allow healthcare providers to manage medications
- **Family Networks**: Multiple family members managing one recipient
- **Advanced Analytics**: Detailed compliance and health insights
- **Multi-language Support**: Internationalization for global families