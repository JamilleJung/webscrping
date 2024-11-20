import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { DataFetcherService } from '@/services/dataFetcher';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const dataFetcher = new DataFetcherService({
      baseURL: process.env.ADMIN_BASE_URL!,
      xsrfToken: process.env.ADMIN_XSRF_TOKEN!,
      sessionToken: process.env.ADMIN_SESSION_TOKEN!
    });

    const deposits = await dataFetcher.fetchAllDeposits();

    // Transform and save data to database
    const savedDeposits = await prisma.$transaction(
      deposits.map(deposit => 
        prisma.deposit.upsert({
          where: { order: deposit.order },
          create: {
            order: deposit.order,
            bankUser: deposit.bankUser,
            username: deposit.username,
            beforeDeposit: parseFloat(deposit.beforeDeposit),
            deposit: parseFloat(deposit.deposit),
            remainingBalance: parseFloat(deposit.remainingBalance),
            transactionTime: new Date(deposit.transactionTime),
            slipTime: new Date(deposit.slipTime),
            bankDeposit: deposit.bankDeposit,
            madeBy: deposit.madeBy,
            status: deposit.status,
            details: deposit.details,
            aff: deposit.aff
          },
          update: {
            bankUser: deposit.bankUser,
            username: deposit.username,
            beforeDeposit: parseFloat(deposit.beforeDeposit),
            deposit: parseFloat(deposit.deposit),
            remainingBalance: parseFloat(deposit.remainingBalance),
            transactionTime: new Date(deposit.transactionTime),
            slipTime: new Date(deposit.slipTime),
            bankDeposit: deposit.bankDeposit,
            madeBy: deposit.madeBy,
            status: deposit.status,
            details: deposit.details,
            aff: deposit.aff
          }
        })
      )
    );

    res.status(200).json({ 
      message: 'Sync completed',
      count: savedDeposits.length 
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      message: 'Error syncing data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}