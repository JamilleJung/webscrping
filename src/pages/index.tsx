// src/pages/index.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  // Redirect to deposits page
  useEffect(() => {
    router.push('/deposits');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800">กำลังโหลด...</h1>
      </div>
    </div>
  );
}