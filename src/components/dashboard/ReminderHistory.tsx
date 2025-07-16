import React, { useState, useEffect } from 'react';
import { Clock, Mail, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getReminderLogs } from '../../lib/database';
import { ReminderLog } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ReminderHistory: React.FC = () => {
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await getReminderLogs(100);
      setLogs(data);
    } catch (error) {
      toast.error('Error loading reminder history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Sent';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Reminder History</h2>
        <button
          onClick={loadLogs}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders sent yet</h3>
          <p className="text-gray-600">Reminder history will appear here once they start being sent.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getStatusIcon(log.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {(log as any).medications?.name || 'Unknown Medication'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(log.status)}`}>
                        {getStatusText(log.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      To: {(log as any).recipients?.name || 'Unknown Recipient'} ({(log as any).recipients?.email || 'Unknown Email'})
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Scheduled: {format(new Date(log.scheduled_time), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      
                      {log.sent_time && (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>Sent: {format(new Date(log.sent_time), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      )}
                    </div>

                    {log.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        Error: {log.error_message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {log.method === 'email' ? (
                    <Mail className="w-4 h-4" />
                  ) : (
                    <span className="text-xs">SMS</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReminderHistory;