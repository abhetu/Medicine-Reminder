/*
  Supabase Edge Function to schedule medicine reminders
  This function can be called via cron job or manually to process and send reminders
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format

    console.log(`Processing reminders for ${currentDate} at ${currentTime}`);

    // Get all active medications with their recipients
    const { data: medications, error: medicationsError } = await supabaseClient
      .rpc('get_active_medications_for_reminders');

    if (medicationsError) {
      console.error('Error fetching medications:', medicationsError);
      throw medicationsError;
    }

    console.log(`Found ${medications?.length || 0} active medications`);

    let remindersProcessed = 0;
    let remindersSent = 0;
    const errors: string[] = [];

    if (medications) {
      for (const medication of medications) {
        // Check if any of the medication times match the current time (within 5 minutes)
        const matchingTimes = medication.times.filter((time: string) => {
          const [medHour, medMinute] = time.split(':').map(Number);
          const [currentHour, currentMinute] = currentTime.split(':').map(Number);
          
          // Check if the time matches within a 5-minute window
          const medMinutes = medHour * 60 + medMinute;
          const currMinutes = currentHour * 60 + currentMinute;
          
          return Math.abs(medMinutes - currMinutes) <= 5;
        });

        if (matchingTimes.length > 0) {
          remindersProcessed++;
          
          // Check if we've already sent a reminder for this medication today at this time
          const scheduledTime = `${currentDate}T${matchingTimes[0]}:00`;
          
          const { data: existingLog } = await supabaseClient
            .from('reminder_logs')
            .select('id')
            .eq('medication_id', medication.medication_id)
            .eq('scheduled_time', scheduledTime)
            .single();

          if (existingLog) {
            console.log(`Reminder already sent for medication ${medication.medication_name} at ${scheduledTime}`);
            continue;
          }

          try {
            // Call the send-reminder function
            const reminderResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-reminder`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                medicationId: medication.medication_id,
                recipientEmail: medication.recipient_email,
                recipientName: medication.recipient_name,
                medicationName: medication.medication_name,
                dosage: medication.dosage,
                scheduledTime: scheduledTime,
              }),
            });

            if (reminderResponse.ok) {
              remindersSent++;
              console.log(`Reminder sent for ${medication.medication_name} to ${medication.recipient_email}`);
            } else {
              const errorText = await reminderResponse.text();
              errors.push(`Failed to send reminder for ${medication.medication_name}: ${errorText}`);
            }

          } catch (error) {
            errors.push(`Error sending reminder for ${medication.medication_name}: ${error.message}`);
          }
        }
      }
    }

    const result = {
      success: true,
      timestamp: now.toISOString(),
      remindersProcessed,
      remindersSent,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('Reminder processing complete:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in schedule-reminders:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process reminders' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});