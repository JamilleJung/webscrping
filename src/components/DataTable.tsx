import React from 'react';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    render?: (value: any) => React.ReactNode;
  }[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({ data, columns, pagination }: DataTableProps<T>) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row: any, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key]) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 bg-white mt-4 rounded-lg shadow">
          <div className="flex items-center text-sm text-gray-500">
            {`แสดง ${pagination.total} รายการ`}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              หน้าแรก
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            <span className="text-sm text-gray-700">
              หน้า {pagination.page} จาก {Math.ceil(pagination.total / pagination.perPage)}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === Math.ceil(pagination.total / pagination.perPage)}
              className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
            <button
              onClick={() => pagination.onPageChange(Math.ceil(pagination.total / pagination.perPage))}
              disabled={pagination.page === Math.ceil(pagination.total / pagination.perPage)}
              className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              หน้าสุดท้าย
            </button>
          </div>
        </div>
      )}
    </div>
  );
}