// src/services/dataFetcher.ts
import axios from 'axios';

interface FetchConfig {
  baseURL: string;
  xsrfToken: string;
  sessionToken: string;
}

// กำหนด interface สำหรับข้อมูลที่จะได้รับ
interface DepositData {
  order: string;
  bankUser: string;
  username: string;
  beforeDeposit: string;
  deposit: string;
  remainingBalance: string;
  transactionTime: string;
  slipTime: string;
  bankDeposit: string;
  madeBy: string;
  status: string;
  details?: string;
  aff?: string;
}

export class DataFetcherService {
  private config: FetchConfig;
  private axiosInstance;

  constructor(config: FetchConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Cookie': `XSRF-TOKEN=${config.xsrfToken}; kingwin88_session=${config.sessionToken}`,
        'X-XSRF-TOKEN': config.xsrfToken
      }
    });
  }

  async fetchDeposits(page: number = 1, perPage: number = 100): Promise<DepositData[]> {
    try {
      const response = await this.axiosInstance.get(`/report/deposit`, {
        params: { page, perPage }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deposits:', error);
      throw error;
    }
  }

  async fetchAllDeposits(): Promise<DepositData[]> {
    let allData: DepositData[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await this.fetchDeposits(page);
      if (data.length < 100) {
        hasMore = false;
      }
      allData = [...allData, ...data];
      page++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return allData;
  }
}