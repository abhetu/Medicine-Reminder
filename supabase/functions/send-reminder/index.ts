/*
  Supabase Edge Function to send medicine reminders via email
  This function will be called by a scheduled job to send reminders
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderRequest {
  medicationId: string;
  recipientEmail: string;
  recipientName: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { medicationId, recipientEmail, recipientName, medicationName, dosage, scheduledTime }: ReminderRequest = await req.json();

    // Create email content
    const emailSubject = `🏥 Medicine Reminder: ${medicationName}`;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background-color: #3b82f6; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <span style="color: white; font-size: 24px;">💊</span>
            </div>
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">Medicine Reminder</h1>
          </div>

          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px;">Time to take your medication!</h2>
            <p style="color: #374151; margin: 0; font-size: 16px;">Hi ${recipientName}, this is a friendly reminder about your medication.</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Medication Details:</h3>
            <div style="background-color: #f9fafb; border-radius: 6px; padding: 15px;">
              <p style="margin: 0 0 8px 0; color: #374151;"><strong>Medication:</strong> ${medicationName}</p>
              <p style="margin: 0 0 8px 0; color: #374151;"><strong>Dosage:</strong> ${dosage}</p>
              <p style="margin: 0; color: #374151;"><strong>Scheduled Time:</strong> ${new Date(scheduledTime).toLocaleString()}</p>
            </div>
          </div>

          <div style="background-color: #fef3c7; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Important:</strong> Please take your medication as prescribed. If you have any questions or concerns, consult with your healthcare provider.
            </p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              This reminder was sent automatically by Medicine Reminder App.<br>
              If you need to modify your medication schedule, please contact your family member who set up these reminders.
            </p>
          </div>
        </div>
      </div>
    `;

    // In a real implementation, you would use a proper email service like:
    // - Resend API
    // - SendGrid API
    // - Amazon SES
    // - Mailgun API
    
    // For this demo, we'll simulate sending the email and log the reminder
    console.log(`Sending email reminder to ${recipientEmail} for ${medicationName}`);
    
    // Create a reminder log entry
    const { error: logError } = await supabaseClient
      .from('reminder_logs')
      .insert({
        medication_id: medicationId,
        recipient_id: '', // This would be populated from the medication data
        scheduled_time: scheduledTime,
        sent_time: new Date().toISOString(),
        method: 'email',
        status: 'sent',
      });

    if (logError) {
      console.error('Error creating reminder log:', logError);
      throw logError;
    }

    // In production, integrate with your preferred email service:
    /*
    // Example with Resend API:
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

    if (!response.ok) {
      throw new Error(`Email service error: ${response.statusText}`);
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Reminder sent successfully',
        email: recipientEmail,
        medication: medicationName
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending reminder:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send reminder' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});