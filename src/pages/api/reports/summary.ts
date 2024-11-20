import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

interface DailyDeposit {
  transactionTime: Date;
  _sum: {
    deposit: number | null;
  };
  _count: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const dateRange = {
      gte: new Date(String(startDate)),
      lte: new Date(String(endDate))
    };

    const [totalDeposits, uniqueUsers, depositsByBank, dailyDeposits] = await Promise.all([
      // Total deposits amount
      prisma.deposit.aggregate({
        where: {
          transactionTime: dateRange,
          status: 'success'
        },
        _sum: {
          deposit: true
        }
      }),

      // Unique users count
      prisma.deposit.groupBy({
        by: ['username'],
        where: {
          transactionTime: dateRange,
          status: 'success'
        },
        _count: true
      }),

      // Deposits by bank
      prisma.deposit.groupBy({
        by: ['bankDeposit'],
        where: {
          transactionTime: dateRange,
          status: 'success'
        },
        _sum: {
          deposit: true
        },
        _count: true
      }),

      // Daily deposits
      prisma.deposit.groupBy({
        by: ['transactionTime'],
        where: {
          transactionTime: dateRange,
          status: 'success'
        },
        _sum: {
          deposit: true
        },
        _count: true
      })
    ]);

    const dailyStats = dailyDeposits.map((day: DailyDeposit) => ({
      date: day.transactionTime,
      amount: day._sum.deposit || 0,
      count: day._count
    }));

    res.status(200).json({
      totalAmount: totalDeposits._sum.deposit || 0,
      uniqueUsersCount: uniqueUsers.length,
      depositsByBank,
      dailyDeposits: dailyStats
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate summary report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}