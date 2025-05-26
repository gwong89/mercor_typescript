'use client';

import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  type ColumnDef,
  type Row,
  type HeaderGroup,
  type Header,
  type Cell,
} from '@tanstack/react-table';
import { useSearchParams } from 'next/navigation';

interface Submission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  submittedAt: string;
  workAvailability: string[];
  annualSalaryExpectation: Record<string, string>;
  workExperiences: Array<{
    company: string;
    roleName: string;
  }>;
  education: {
    highestLevel: string;
    degrees: Array<{
      degree: string;
      subject: string;
      school: string;
      gpa: string;
    }>;
  } | null;
  skills: Array<{
    name: string;
  }>;
}

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export default function SubmissionsPage() {
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const searchParams = useSearchParams();
  const filterId = searchParams.get('filter');

  const columns: ColumnDef<Submission>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: { row: Row<Submission> }) => {
        const value = row.getValue('name');
        return value || 'N/A';
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: { row: Row<Submission> }) => {
        const value = row.getValue('email');
        return value || 'N/A';
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }: { row: Row<Submission> }) => {
        const value = row.getValue('location');
        return value || 'N/A';
      },
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted At',
      cell: ({ row }: { row: Row<Submission> }) => {
        const value = row.getValue('submittedAt');
        if (!value || typeof value !== 'string') return 'N/A';
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return 'Invalid Date';
        }
      },
    },
    {
      accessorKey: 'workAvailability',
      header: 'Work Availability',
      cell: ({ row }: { row: Row<Submission> }) => {
        const value = row.getValue('workAvailability');
        if (!Array.isArray(value)) return 'N/A';
        return value.length > 0 ? value.join(', ') : 'N/A';
      },
    },
    {
      accessorKey: 'annualSalaryExpectation',
      header: 'Salary Range',
      cell: ({ row }: { row: Row<Submission> }) => {
        const value = row.getValue('annualSalaryExpectation');
        if (!value || typeof value !== 'object') return 'N/A';
        const salary = value as Record<string, string>;
        return Object.values(salary)[0] || 'N/A';
      },
    },
    {
      accessorKey: 'education',
      header: 'Education',
      cell: ({ row }: { row: Row<Submission> }) => {
        const value = row.getValue('education');
        if (!value || typeof value !== 'object') return 'N/A';
        const education = value as Submission['education'];
        if (!education?.highestLevel) return 'N/A';
        const highestDegree = education.degrees?.reduce((highest, current) => {
          if (!highest) return current;
          return current.degree > highest.degree ? current : highest;
        }, education.degrees[0]);
        return highestDegree?.degree || education.highestLevel;
      },
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `/api/submissions?page=${pagination.pageIndex + 1}&pageSize=${pagination.pageSize}`;
      if (filterId) {
        url += `&filter=${filterId}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch submissions');
      }

      setData(result.submissions);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
  });

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Submissions</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<Submission>) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row: Row<Submission>) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell: Cell<Submission, unknown>) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
} 