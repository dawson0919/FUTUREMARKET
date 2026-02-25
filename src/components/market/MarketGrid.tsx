"use client";

import { useState } from "react";
import { MarketCard } from "./MarketCard";
import { useMarkets, usePrices } from "@/lib/hooks";
import { Loader2 } from "lucide-react";

const filters = [
  { key: "all", label: "All Markets" },
  { key: "crypto", label: "Crypto" },
  { key: "futures", label: "Futures" },
];

export function MarketGrid() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { markets, loading } = useMarkets(activeFilter);
  const { prices } = usePrices();

  const filteredMarkets =
    activeFilter === "all"
      ? markets
      : markets.filter((m) => m.instrument?.type === activeFilter);

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredMarkets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No markets available</p>
          <p className="text-muted-foreground text-sm mt-1">
            Markets are created daily. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              currentPrice={prices[market.instrument?.symbol || ""]?.price}
            />
          ))}
        </div>
      )}
    </div>
  );
}
