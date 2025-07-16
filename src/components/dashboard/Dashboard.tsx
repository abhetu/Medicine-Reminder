import React, { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, Plus, Users, Pill, Calendar, CheckCircle } from 'lucide-react';
import { signOut, getCurrentUser } from '../../lib/supabase';
import { getDashboardStats } from '../../lib/database';
import { DashboardStats } from '../../types';
import toast from 'react-hot-toast';
import RecipientManager from './RecipientManager';
import MedicationManager from './MedicationManager';
import ReminderHistory from './ReminderHistory';

interface DashboardProps {
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'recipients' | 'medications' | 'history'>('recipients');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    const { user } = await getCurrentUser();
    if (user) {
      setUserEmail(user.email || '');
    }
  };

  const loadStats = async () => {
    try {
      const { user } = await getCurrentUser();
      if (user) {
        const dashboardStats = await getDashboardStats(user.id);
        setStats(dashboardStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      onSignOut();
    }
  };

  const refreshStats = () => {
    loadStats();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Medicine Reminder
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recipients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecipients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Pill className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Medications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMedications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Reminders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.remindersToday}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sent Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.remindersSent}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('recipients')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'recipients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Recipients</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('medications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'medications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Pill className="w-4 h-4" />
                  <span>Medications</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Reminder History</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'recipients' && <RecipientManager onUpdate={refreshStats} />}
            {activeTab === 'medications' && <MedicationManager onUpdate={refreshStats} />}
            {activeTab === 'history' && <ReminderHistory />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;