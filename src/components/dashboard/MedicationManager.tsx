import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Edit2, Trash2, Pill, Clock, Calendar, User, Loader2 } from 'lucide-react';
import { getMedications, createMedication, updateMedication, deleteMedication, getRecipients } from '../../lib/database';
import { getCurrentUser } from '../../lib/supabase';
import { Medication, Recipient } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const schema = yup.object({
  recipient_id: yup.string().required('Recipient is required'),
  name: yup.string().required('Medication name is required'),
  dosage: yup.string().required('Dosage is required'),
  frequency: yup.string().oneOf(['once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'custom']).required('Frequency is required'),
  times: yup.array().of(yup.string()).min(1, 'At least one time is required'),
  start_date: yup.string().required('Start date is required'),
  end_date: yup.string().required('End date is required'),
  notes: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

interface MedicationManagerProps {
  onUpdate: () => void;
}

const frequencyOptions = [
  { value: 'once_daily', label: 'Once daily', defaultTimes: ['08:00'] },
  { value: 'twice_daily', label: 'Twice daily', defaultTimes: ['08:00', '20:00'] },
  { value: 'three_times_daily', label: 'Three times daily', defaultTimes: ['08:00', '14:00', '20:00'] },
  { value: 'four_times_daily', label: 'Four times daily', defaultTimes: ['08:00', '12:00', '16:00', '20:00'] },
  { value: 'custom', label: 'Custom', defaultTimes: ['08:00'] },
];

const MedicationManager: React.FC<MedicationManagerProps> = ({ onUpdate }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [customTimes, setCustomTimes] = useState<string[]>(['08:00']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const frequency = watch('frequency');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (frequency && frequency !== 'custom') {
      const option = frequencyOptions.find(opt => opt.value === frequency);
      if (option) {
        setCustomTimes(option.defaultTimes);
        setValue('times', option.defaultTimes);
      }
    }
  }, [frequency, setValue]);

  const loadData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (user) {
        const [medicationsData, recipientsData] = await Promise.all([
          getMedications(),
          getRecipients(user.id),
        ]);
        setMedications(medicationsData);
        setRecipients(recipientsData);
      }
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const medicationData = {
        ...data,
        times: customTimes,
        is_active: true,
      };

      if (editingMedication) {
        await updateMedication(editingMedication.id, medicationData);
        toast.success('Medication updated successfully');
      } else {
        await createMedication(medicationData);
        toast.success('Medication added successfully');
      }

      reset();
      setShowForm(false);
      setEditingMedication(null);
      setCustomTimes(['08:00']);
      loadData();
      onUpdate();
    } catch (error) {
      toast.error('Error saving medication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setValue('recipient_id', medication.recipient_id);
    setValue('name', medication.name);
    setValue('dosage', medication.dosage);
    setValue('frequency', medication.frequency);
    setValue('start_date', medication.start_date);
    setValue('end_date', medication.end_date);
    setValue('notes', medication.notes || '');
    setValue('times', medication.times);
    setCustomTimes(medication.times);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await deleteMedication(id);
        toast.success('Medication deleted successfully');
        loadData();
        onUpdate();
      } catch (error) {
        toast.error('Error deleting medication');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMedication(null);
    setCustomTimes(['08:00']);
    reset();
  };

  const addCustomTime = () => {
    setCustomTimes([...customTimes, '08:00']);
  };

  const removeCustomTime = (index: number) => {
    const newTimes = customTimes.filter((_, i) => i !== index);
    setCustomTimes(newTimes);
    setValue('times', newTimes);
  };

  const updateCustomTime = (index: number, value: string) => {
    const newTimes = [...customTimes];
    newTimes[index] = value;
    setCustomTimes(newTimes);
    setValue('times', newTimes);
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
        <h2 className="text-lg font-semibold text-gray-900">Medications</h2>
        <button
          onClick={() => setShowForm(true)}
          disabled={recipients.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </div>

      {recipients.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            You need to add at least one recipient before creating medications.
          </p>
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingMedication ? 'Edit Medication' : 'Add New Medication'}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient
                </label>
                <select
                  {...register('recipient_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select recipient</option>
                  {recipients.map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name}
                    </option>
                  ))}
                </select>
                {errors.recipient_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipient_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter medication name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  {...register('dosage')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1 tablet, 5ml"
                />
                {errors.dosage && (
                  <p className="mt-1 text-sm text-red-600">{errors.dosage.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  {...register('frequency')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select frequency</option>
                  {frequencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.frequency && (
                  <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  {...register('start_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  {...register('end_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            {frequency && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Times
                </label>
                <div className="space-y-2">
                  {customTimes.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateCustomTime(index, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {frequency === 'custom' && customTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCustomTime(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {frequency === 'custom' && (
                    <button
                      type="button"
                      onClick={addCustomTime}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add another time
                    </button>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional instructions or notes"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{editingMedication ? 'Update' : 'Add'} Medication</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {medications.length === 0 ? (
        <div className="text-center py-12">
          <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medications yet</h3>
          <p className="text-gray-600 mb-4">Add a medication to start setting up reminders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {medications.map((medication) => {
            const recipient = recipients.find(r => r.id === medication.recipient_id);
            return (
              <div key={medication.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
                    <Pill className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(medication)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(medication.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-medium text-gray-900 mb-2">{medication.name}</h3>
                <p className="text-sm text-gray-600 mb-3">Dosage: {medication.dosage}</p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{recipient?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{medication.times.join(', ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(medication.start_date), 'MMM d')} - {format(new Date(medication.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                {medication.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    {medication.notes}
                  </div>
                )}

                <div className="mt-3 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    medication.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {medication.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {frequencyOptions.find(f => f.value === medication.frequency)?.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicationManager;