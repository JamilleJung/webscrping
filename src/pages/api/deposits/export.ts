// src/pages/api/deposits/export.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface Deposit {
  id: number;
  order: string; 
  bankUser: string;
  username: string;
  deposit: number;
  beforeDeposit: number;
  remainingBalance: number;
  transactionTime: Date;
  slipTime: Date;
  bankDeposit: string;
  madeBy: string;
  status: string;
  details: string | null; // เปลี่ยนจาก string? เป็น string | null
  aff: string | null;    // เปลี่ยนจาก string? เป็น string | null
  createdAt: Date;
  updatedAt: Date;
 }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, startDate, endDate } = req.query;

    const where = {
      ...(username && { username: { contains: String(username) } }),
      ...(startDate && endDate && {
        transactionTime: {
          gte: new Date(String(startDate)),
          lte: new Date(String(endDate))
        }
      })
    };

    const deposits = (await prisma.deposit.findMany({
      where,
      orderBy: { transactionTime: 'desc' }
     })) as Deposit[];

    // Transform data for Excel
    const excelData = deposits.map(deposit => ({
      'ลำดับ': deposit.order,
      'บัญชีผู้ใช้': deposit.bankUser,
      'ยูสเซอร์': deposit.username,
      'ยอดก่อนฝาก': deposit.beforeDeposit,
      'จำนวนเงินฝาก': deposit.deposit,
      'ยอดคงเหลือ': deposit.remainingBalance,
      'เวลาทำรายการ': format(deposit.transactionTime, 'dd/MM/yyyy HH:mm:ss'),
      'เวลาสลิป': format(deposit.slipTime, 'dd/MM/yyyy HH:mm:ss'),
      'ธนาคารที่ฝาก': deposit.bankDeposit,
      'สถานะ': deposit.status,
      'ทำโดย': deposit.madeBy,
      'รายละเอียด': deposit.details || '',
      'ผู้แนะนำ/ทีมการตลาด': deposit.aff || ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Deposits');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=deposits-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    res.send(buf);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}