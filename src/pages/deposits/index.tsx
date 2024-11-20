import { useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function DepositsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['deposits', page, search, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: '10',
        ...(search && { username: search }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/deposits?${params}`);
      if (!response.ok) throw new Error('Failed to fetch deposits');
      return response.json();
    }
  });

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(search && { username: search }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/deposits/export?${params}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deposits-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('ไม่สามารถส่งออกข้อมูลได้');
    }
  };

  const columns = [
    { key: 'order', label: 'ลำดับ' },
    { key: 'bankUser', label: 'บัญชีผู้ใช้' },
    { key: 'username', label: 'ยูสเซอร์' },
    { 
      key: 'deposit', 
      label: 'จำนวนเงิน',
      render: (value: number) => value.toLocaleString('th-TH', {
        style: 'currency',
        currency: 'THB'
      })
    },
    {
      key: 'transactionTime',
      label: 'เวลาทำรายการ',
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy HH:mm:ss')
    },
    { key: 'status', label: 'สถานะ' },
    { key: 'madeBy', label: 'ทำโดย' },
    { key: 'aff', label: 'ผู้แนะนำ/ทีมการตลาด' }
  ];

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        เกิดข้อผิดพลาดในการโหลดข้อมูล
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">รายการฝากเงิน</h1>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="ค้นหาด้วยยูสเซอร์"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ส่งออก Excel
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">กำลังโหลดข้อมูล...</div>
      ) : (
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          pagination={{
            page,
            perPage: 10,
            total: data?.pagination.total ?? 0,
            onPageChange: setPage
          }}
        />
      )}
    </div>
  );
}