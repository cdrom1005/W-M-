import { GoogleGenAI } from "@google/genai";

// Mock service to simulate the Google Apps Script backend
export interface StockData {
  lots: string;
  price: string;
}

export interface UserSettings {
  [key: string]: StockData;
}

export interface DividendItem {
  amount: number;
  profit: number;
  currentPrice: number;
  buyPrice: number;
  qty: number;
  payDate?: string;
  exDate?: string;
  fx?: number;
}

export interface ComputeResult {
  updatedAt: string;
  items: {
    [key: string]: DividendItem;
  };
}

const STOCK_CODES = ["0056", "00878", "00919", "00953B", "00937B", "00933B", "QQQI", "CLOZ"];

export const mockBackend = {
  getUserSettings: async (username: string): Promise<UserSettings> => {
    await new Promise(r => setTimeout(r, 800));
    // For testing purposes, return empty data so user can test the "+" button
    // Unless the username is "demo", then return some data
    if (username.toLowerCase() === 'demo') {
      const mockData: UserSettings = {};
      STOCK_CODES.slice(0, 2).forEach(code => {
        mockData[code] = {
          lots: "5",
          price: "25.5"
        };
      });
      return mockData;
    }
    return {};
  },

  saveUserSettings: async (username: string, payload: UserSettings) => {
    console.log("Saving user settings for", username, payload);
    await new Promise(r => setTimeout(r, 500));
  },

  computeDividends: async (payload: UserSettings): Promise<ComputeResult> => {
    await new Promise(r => setTimeout(r, 1200));
    const items: { [key: string]: DividendItem } = {};
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const US_STOCKS = ["QQQI", "CLOZ"];

    STOCK_CODES.forEach(code => {
      const p = payload[code];
      if (!p || !p.lots) return;

      const isUS = US_STOCKS.includes(code);
      const lots = parseFloat(p.lots);
      const buyPrice = parseFloat(p.price) || 0;
      const currentPrice = buyPrice * (1 + (Math.random() * 0.2 - 0.1)); // +/- 10%
      const qty = isUS ? lots : lots * 1000;
      const profit = Math.round((currentPrice - buyPrice) * qty);
      
      // Mock dividend amount
      const dividendPerUnit = isUS ? 0.5 : 0.6;
      const amount = Math.round(qty * dividendPerUnit);

      items[code] = {
        amount,
        profit,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        buyPrice: parseFloat(buyPrice.toFixed(2)),
        qty,
        payDate: `${currentMonth}月${Math.floor(Math.random() * 20) + 10}日`,
        exDate: `${currentMonth}月${Math.floor(Math.random() * 5) + 1}日`,
        fx: isUS ? 32.5 : undefined
      };
    });

    return {
      updatedAt: now.toLocaleString(),
      items
    };
  },

  getLineLoginUrl: async (): Promise<string> => {
    return "https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=MOCK&redirect_uri=MOCK&state=MOCK&scope=profile%20openid";
  }
};
