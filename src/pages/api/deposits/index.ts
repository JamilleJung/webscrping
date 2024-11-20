import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = '1', perPage = '10', username, startDate, endDate } = req.query;

      const where = {
        ...(username && { username: { contains: String(username) } }),
        ...(startDate && endDate && {
          transactionTime: {
            gte: new Date(String(startDate)),
            lte: new Date(String(endDate))
          }
        })
      };

      const deposits = await prisma.deposit.findMany({
        where,
        take: Number(perPage),
        skip: (Number(page) - 1) * Number(perPage),
        orderBy: {
          transactionTime: 'desc'
        }
      });

      const total = await prisma.deposit.count({ where });

      res.status(200).json({
        data: deposits,
        pagination: {
          page: Number(page),
          perPage: Number(perPage),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to fetch deposits',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}