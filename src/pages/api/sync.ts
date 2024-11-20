import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer, { Browser } from 'puppeteer';
import { PrismaClient, Prisma } from '@prisma/client';
import { parse } from 'date-fns';
import { th } from 'date-fns/locale';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Enable Prisma query and error logs
});

const BASE_URL = process.env.BASE_URL || 'https://admin.kingwin88.online/report/deposit';
const XSRF_TOKEN = process.env.XSRF_TOKEN;
const KINGWIN88_SESSION = process.env.KINGWIN88_SESSION;

const cookies = [
  {
    name: 'XSRF-TOKEN',
    value: XSRF_TOKEN || '',
    domain: new URL(BASE_URL).hostname,
  },
  {
    name: 'kingwin88_session',
    value: KINGWIN88_SESSION || '',
    domain: new URL(BASE_URL).hostname,
  },
];

const PER_PAGE = 100;
const THREADS = 2;
const DELAY_BETWEEN_THREADS = 2000;
const MAX_RETRIES = 3;

async function fetchPage(page: number, browser: Browser, retries = 0): Promise<any[]> {
  const pageInstance = await browser.newPage();

  try {
    if (!browser.isConnected()) {
      throw new Error('Browser disconnected. Please check your connection.');
    }

    await pageInstance.setCookie(...cookies);

    const url = `${BASE_URL}?page=${page}&perPage=${PER_PAGE}`;
    await pageInstance.goto(url, { waitUntil: 'load', timeout: 60000 });

    try {
      await pageInstance.waitForSelector('table tbody', { timeout: 30000 });
    } catch (error) {
      console.error(`Unable to load table on page ${page}:`, (error as Error).message);
      throw error;
    }

    const data = await pageInstance.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const extractedData: any[] = [];

      rows.forEach((row) => {
        const cols = row.querySelectorAll('td');
        if (cols.length > 0) {
          const item = {
            order: cols[0]?.innerText.trim(),
            bankUser: cols[1]?.innerText.trim(),
            username: cols[2]?.innerText.trim(),
            beforeDeposit: cols[3]?.innerText.trim(),
            deposit: cols[4]?.innerText.trim(),
            remainingBalance: cols[5]?.innerText.trim(),
            transactionTime: cols[6]?.innerText.trim(),
            slipTime: cols[7]?.innerText.trim(),
            bankDeposit: cols[8]?.innerText.trim(),
            madeBy: cols[9]?.innerText.trim(),
            status: cols[10]?.innerText.trim(),
            details: cols[11]?.innerText.trim(),
            aff: cols[12]?.innerText.trim(),
          };
          if (item.order !== 'กำลังโหลด...') {
            extractedData.push(item);
          }
        }
      });

      return extractedData;
    });

    console.log(`Successfully fetched data from page ${page}:`, data.length, 'items');
    await pageInstance.close();

    return data;
  } catch (error) {
    console.error(`Error fetching data on page ${page}:`, (error as Error).message);
    if (retries < MAX_RETRIES) {
      console.log(`Retrying page ${page} (attempt ${retries + 1})...`);
      await pageInstance.close();
      return fetchPage(page, browser, retries + 1);
    } else {
      console.log(`Page ${page} failed after ${MAX_RETRIES} attempts.`);
      await pageInstance.close();
      return [];
    }
  }
}

async function saveToDatabase(data: any[]) {
  if (data.length === 0) {
    console.log('No data to save.');
    return;
  }

  const formattedData = data
    .map((item) => {
      try {
        const transactionTime = parse(item.transactionTime, 'd MMM yy HH:mm น.', new Date(), { locale: th });
        const slipTime = parse(item.slipTime, 'd MMM yy HH:mm น.', new Date(), { locale: th });

        // Check if the parsed dates are valid
        if (isNaN(transactionTime.getTime()) || isNaN(slipTime.getTime())) {
          console.error('Invalid date format for item:', item);
          return null; // Skip this record
        }

        return {
          order: item.order,
          bankUser: item.bankUser,
          username: item.username.trim().replace(/\n/g, ' '),
          beforeDeposit: parseFloat(item.beforeDeposit || '0'),
          deposit: parseFloat(item.deposit || '0'),
          remainingBalance: parseFloat(item.remainingBalance || '0'),
          transactionTime,
          slipTime,
          bankDeposit: item.bankDeposit.trim().replace(/\n/g, ' '),
          madeBy: item.madeBy.trim(),
          status: item.status.trim(),
          details: item.details || null,
          aff: item.aff || null,
        };
      } catch (error) {
        console.error('Error formatting item:', item, error);
        return null; // Skip problematic items
      }
    })
    .filter((item) => item !== null);

  try {
    const result = await prisma.deposit.createMany({
      data: formattedData,
      skipDuplicates: true,
    });

    console.log(`Saved ${result.count} records to the database.`);
  } catch (error) {
    console.error('Error saving data to the database:');
    console.error('Message:', error instanceof Error ? error.message : error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Meta:', error.meta);
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error('Validation Error:', error.message);
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let browser: Browser | undefined;
  let page = 1;

  try {
    browser = await puppeteer.launch({ headless: true });

    while (true) {
      const pagePromises = Array.from({ length: THREADS }, async (_, i) => {
        try {
          return await fetchPage(page + i, browser as Browser);
        } catch (error) {
          console.error(`Thread for page ${page + i} failed:`, (error as Error).message);
          return [];
        }
      });

      const results = await Promise.all(pagePromises);
      const batchData = results.flat();

      // Save batch data to database
      await saveToDatabase(batchData);

      console.log(`Processed ${batchData.length} items from ${THREADS} pages`);

      const hasFewItems = results.some((data) => data.length <= 2);
      if (hasFewItems) {
        console.log('Stopping fetch: Last page has 2 or fewer items.');
        break;
      }

      page += THREADS;
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_THREADS));
    }

    console.log('Data fetch and save completed');
    res.status(200).json({ message: 'Data fetch and save completed successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
