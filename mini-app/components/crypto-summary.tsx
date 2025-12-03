"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface TokenData {
  name: string;
  symbol: string;
  market_cap: number;
  current_price: number;
  description: string;
}

export default function CryptoSummary() {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/openxai"
        );
        const json = await res.json();
        setData({
          name: json.name,
          symbol: json.symbol.toUpperCase(),
          market_cap: json.market_data.market_cap.usd,
          current_price: json.market_data.current_price.usd,
          description: json.description.en.split(".")[0] + ".",
        });
      } catch (e) {
        setError("Failed to load token data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Loading token summary...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{data.name} ({data.symbol})</CardTitle>
        <CardDescription>Token summary</CardDescription>
      </CardHeader>
      <CardContent>
        <p><strong>Current Price:</strong> ${data.current_price.toLocaleString()}</p>
        <p><strong>Market Cap:</strong> ${data.market_cap.toLocaleString()}</p>
        <p><strong>Description:</strong> {data.description}</p>
      </CardContent>
    </Card>
  );
}
