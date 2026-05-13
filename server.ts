import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CoinGecko Proxy API
  app.get("/api/prices", async (req, res) => {
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
      
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching prices from CoinGecko:", error);
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  });

  app.get("/api/markets", async (req, res) => {
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
      
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching markets from CoinGecko:", error);
      res.status(500).json({ error: "Failed to fetch markets" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
