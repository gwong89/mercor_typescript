'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Filter {
  id: number;
  name: string;
  description?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  workAvailability: string[];
  minEducation?: string;
  skills: string[];
}

const EDUCATION_LEVELS = [
  "High School Diploma",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate"
];

const WORK_AVAILABILITY = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Remote',
];

export default function FiltersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Filter>>({
    name: '',
    description: '',
    location: '',
    minSalary: undefined,
    maxSalary: undefined,
    workAvailability: [],
    minEducation: undefined,
    skills: [],
  });

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/submissions/filters');
      if (!response.ok) throw new Error('Failed to fetch filters');
      const data = await response.json();
      setFilters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editingId) {
        response = await fetch(`/api/submissions/filters/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('/api/submissions/filters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      if (!response.ok) throw new Error(editingId ? 'Failed to update filter' : 'Failed to create filter');
      await fetchFilters();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        location: '',
        minSalary: undefined,
        maxSalary: undefined,
        workAvailability: [],
        minEducation: undefined,
        skills: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this filter?')) return;
    
    try {
      const response = await fetch(`/api/submissions/filters/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete filter');
      
      await fetchFilters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Submission Filters</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Filter'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Salary</label>
                <input
                  type="number"
                  value={formData.minSalary}
                  onChange={(e) => setFormData({ ...formData, minSalary: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Salary</label>
                <input
                  type="number"
                  value={formData.maxSalary}
                  onChange={(e) => setFormData({ ...formData, maxSalary: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Work Availability</label>
              <select
                multiple
                value={formData.workAvailability}
                onChange={(e) => setFormData({
                  ...formData,
                  workAvailability: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {WORK_AVAILABILITY.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Education</label>
              <select
                value={formData.minEducation}
                onChange={(e) => setFormData({ ...formData, minEducation: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select education level</option>
                {EDUCATION_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills?.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingId ? 'Update Filter' : 'Save Filter'}
            </button>
            {editingId && (
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => {
                  setEditingId(null);
                  setShowForm(false);
                  setFormData({
                    name: '',
                    description: '',
                    location: '',
                    minSalary: undefined,
                    maxSalary: undefined,
                    workAvailability: [],
                    minEducation: undefined,
                    skills: [],
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filters.map((filter) => (
          <div key={filter.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{filter.name}</h3>
                {filter.description && (
                  <p className="text-gray-600 text-sm">{filter.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(filter.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-800">
              {filter.location && (
                <p><span className="font-medium">Location:</span> {filter.location}</p>
              )}
              {(filter.minSalary || filter.maxSalary) && (
                <p>
                  <span className="font-medium">Salary Range:</span>{' '}
                  {filter.minSalary && `$${filter.minSalary.toLocaleString()}`}
                  {filter.minSalary && filter.maxSalary && ' - '}
                  {filter.maxSalary && `$${filter.maxSalary.toLocaleString()}`}
                </p>
              )}
              {filter.workAvailability.length > 0 && (
                <p>
                  <span className="font-medium">Work Availability:</span>{' '}
                  {filter.workAvailability.join(', ')}
                </p>
              )}
              {filter.minEducation && (
                <p><span className="font-medium">Min Education:</span> {filter.minEducation}</p>
              )}
              {filter.skills.length > 0 && (
                <p>
                  <span className="font-medium">Skills:</span>{' '}
                  {filter.skills.join(', ')}
                </p>
              )}
            </div>

            <button
              onClick={() => router.push(`/submissions?filter=${filter.id}`)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              View Results
            </button>

            <button
              onClick={() => {
                setEditingId(filter.id);
                setFormData({ ...filter });
                setShowForm(true);
              }}
              className="text-blue-600 hover:text-blue-800 mr-2"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 