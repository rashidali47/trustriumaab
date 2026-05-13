import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { ids, vs_currencies, include_24hr_change } = req.query;
    const apiKey = process.env.COINGECKO_API_KEY;
    
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
      params: {
        ids,
        vs_currencies,
        include_24hr_change,
        x_cg_demo_api_key: apiKey
      }
    });
    
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error fetching prices from CoinGecko:", error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message;
    res.status(status).json({ error: "Failed to fetch prices", details: message });
  }
}
