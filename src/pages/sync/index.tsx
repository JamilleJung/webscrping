import { useState } from 'react';

export default function SyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Sync failed:', error);
      setResult({ error: 'Sync failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Web Scraping Dashboard</h1>
        
        {/* Sync Button */}
        <div className="mb-8">
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลใหม่'}
          </button>
        </div>

        {/* Status Display */}
        {isLoading && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
            กำลังดึงข้อมูล กรุณารอสักครู่...
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="bg-white shadow rounded p-4">
            <h2 className="text-lg font-semibold mb-2">ผลการดึงข้อมูล</h2>
            {result.error ? (
              <div className="text-red-500">
                เกิดข้อผิดพลาด: {result.error}
              </div>
            ) : (
              <div>
                <div className="text-green-500 mb-2">
                  ดึงข้อมูลสำเร็จ
                </div>
                <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Recent Syncs */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">ประวัติการดึงข้อมูล</h2>
          <div className="bg-white shadow rounded overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวนข้อมูล
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* สามารถเพิ่มข้อมูลประวัติการ sync ได้ที่นี่ */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}