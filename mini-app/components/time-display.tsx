"use client";

import { useEffect, useState } from "react";

export default function TimeDisplay() {
  const [localTime, setLocalTime] = useState<string>("");
  const [utcTime, setUtcTime] = useState<string>("");
  const [quote, setQuote] = useState<string>("");

  useEffect(() => {
    function updateTimes() {
      const now = new Date();
      setLocalTime(now.toLocaleString());
      setUtcTime(now.toUTCString());
    }
    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const res = await fetch("https://api.quotable.io/random");
        const data = await res.json();
        setQuote(data.content);
      } catch (e) {
        console.error("Failed to fetch quote", e);
      }
    }
    fetchQuote();
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-md shadow-sm bg-background">
      <p className="text-sm">Local Time: {localTime}</p>
      <p className="text-sm">UTC Time: {utcTime}</p>
      <p className="text-sm italic">Quote: {quote}</p>
    </div>
  );
}
