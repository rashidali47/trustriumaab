import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { vs_currency, order, per_page, page, sparkline } = req.query;
    const apiKey = process.env.COINGECKO_API_KEY;
    
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: vs_currency || 'usd',
        order: order || 'market_cap_desc',
        per_page: per_page || 50,
        page: page || 1,
        sparkline: sparkline || false,
        price_change_percentage: '24h',
        x_cg_demo_api_key: apiKey
      }
    });
    
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error fetching markets from CoinGecko:", error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message;
    res.status(status).json({ error: "Failed to fetch markets", details: message });
  }
}
