import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { httpService } from '@/services/http.service';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface FormSubmission {
  _id: string;
  formType: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  updatedAt: string;
}

const FormSubmissions: React.FC = () => {
  const { t, i18n } = useTranslation(['forms', 'common']);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState({
    formType: 'all',
    status: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/unauthorized");
      return;
    }
    fetchSubmissions();
  }, [navigate, user]);

  useEffect(() => {
    applyFilters();
  }, [filter, submissions]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await httpService.get('/api/forms', true);
      setSubmissions(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...submissions];
    
    // Apply form type filter
    if (filter.formType !== 'all') {
      result = result.filter(sub => sub.formType === filter.formType);
    }
    
    // Apply status filter
    if (filter.status !== 'all') {
      result = result.filter(sub => sub.status === filter.status);
    }
    
    // Apply search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(sub => 
        sub.name.toLowerCase().includes(query) || 
        sub.email.toLowerCase().includes(query) || 
        sub.message.toLowerCase().includes(query)
      );
    }
    
    setFilteredSubmissions(result);
  };

  const updateStatus = async (id: string, newStatus: FormSubmission['status']) => {
    try {
      setLoading(true);
      await httpService.put(`/api/forms/${id}/status`, { status: newStatus }, true);
      
      setSubmissions(submissions.map(sub => 
        sub._id === id ? { ...sub, status: newStatus } : sub
      ));
      
      setSuccessMessage(t('statusUpdated'));
      setTimeout(() => setSuccessMessage(''), 3000);
      setError('');
    } catch (err) {
      console.error(err);
      setError(t('updateError'));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    try {
      setLoading(true);
      await httpService.del(`/api/forms/${id}`, true);
      
      setSubmissions(submissions.filter(sub => sub._id !== id));
      setSuccessMessage(t('deleted'));
      setTimeout(() => setSuccessMessage(''), 3000);
      setError('');
    } catch (err) {
      console.error(err);
      setError(t('deleteError'));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (submission: FormSubmission) => {
    alert(`
${t('formDetails')}:

${t('type')}: ${submission.formType}
${t('name')}: ${submission.name}
${t('email')}: ${submission.email}
${t('phone')}: ${submission.phone || t('notProvided')}
${t('date')}: ${new Date(submission.createdAt).toLocaleString()}

${t('message')}:
${submission.message}
    `);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(i18n.language);
  };

  const getUniqueFormTypes = (): string[] => {
    const types = new Set(submissions.map(sub => sub.formType));
    return Array.from(types);
  };

  if (loading && submissions.length === 0) return <div className="text-center py-8">{t('loading', { ns: 'common' })}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('submissionsTitle')}</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filterByType')}
          </label>
          <select 
            className="rounded border-gray-300 px-3 py-2"
            value={filter.formType}
            onChange={(e) => setFilter({...filter, formType: e.target.value})}
          >
            <option value="all">{t('allTypes')}</option>
            {getUniqueFormTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filterByStatus')}
          </label>
          <select 
            className="rounded border-gray-300 px-3 py-2"
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="new">{t('statusNew')}</option>
            <option value="read">{t('statusRead')}</option>
            <option value="replied">{t('statusReplied')}</option>
            <option value="archived">{t('statusArchived')}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('search')}
          </label>
          <input
            type="text"
            className="rounded border-gray-300 px-3 py-2"
            placeholder={t('searchPlaceholder')}
            value={filter.searchQuery}
            onChange={(e) => setFilter({...filter, searchQuery: e.target.value})}
          />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          {t('totalSubmissions')}: <span className="font-semibold">{filteredSubmissions.length}</span>
          {filter.formType !== 'all' || filter.status !== 'all' || filter.searchQuery ? 
            ` (${t('filtered')})` : ''}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-center">{t('date')}</th>
              <th className="px-6 py-3 border-b text-center">{t('type')}</th>
              <th className="px-6 py-3 border-b text-center">{t('name')}</th>
              <th className="px-6 py-3 border-b text-center">{t('email')}</th>
              <th className="px-6 py-3 border-b text-center">{t('status')}</th>
              <th className="px-6 py-3 border-b text-center">{t('actions', { ns: 'common' })}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map(submission => (
                <tr key={submission._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b text-center">
                    {formatDate(submission.createdAt)}
                  </td>
                  <td className="px-6 py-4 border-b text-center">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {submission.formType}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b text-center">{submission.name}</td>
                  <td className="px-6 py-4 border-b text-center">{submission.email}</td>
                  <td className="px-6 py-4 border-b text-center">
                    <select
                      value={submission.status}
                      onChange={(e) => updateStatus(submission._id, e.target.value as FormSubmission['status'])}
                      className="rounded border-gray-300 text-sm"
                      disabled={loading}
                    >
                      <option value="new">{t('statusNew')}</option>
                      <option value="read">{t('statusRead')}</option>
                      <option value="replied">{t('statusReplied')}</option>
                      <option value="archived">{t('statusArchived')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 border-b text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(submission)}
                        className="text-blue-600 hover:text-blue-800 text-sm bg-blue-100 px-2 py-1 rounded"
                        disabled={loading}
                      >
                        {t('viewDetails')}
                      </button>
                      <button
                        onClick={() => deleteSubmission(submission._id)}
                        className="text-red-600 hover:text-red-800 text-sm bg-red-100 px-2 py-1 rounded"
                        disabled={loading}
                      >
                        {t('delete', { ns: 'common' })}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 border-b">
                  {t('noSubmissions')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormSubmissions;