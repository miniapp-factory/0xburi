"use client";

import { useEffect, useState } from "react";

export default function OpenXMonitor() {
  const [price, setPrice] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [color, setColor] = useState<string>("gray");

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=openxai&vs_currencies=usd"
        );
        const data = await res.json();
        const newPrice = data.openxai.usd as number;
        setPrevPrice(price);
        setPrice(newPrice);
        if (prevPrice !== null) {
          setColor(newPrice > prevPrice ? "blue" : "red");
        }
      } catch (e) {
        console.error("Failed to fetch OPENX price", e);
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [price, prevPrice]);

  return (
    <div
      className="flex flex-col items-center gap-4 p-6 rounded-lg shadow-md"
      style={{ backgroundColor: color }}
    >
      <h2 className="text-2xl font-semibold">OPENX Price Monitor</h2>
      <p className="text-xl">
        {price !== null ? `$${price.toLocaleString()}` : "Loading..."}
      </p>
    </div>
  );
}
