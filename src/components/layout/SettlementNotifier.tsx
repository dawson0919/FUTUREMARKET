"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/toast-notification";
import { formatChips } from "@/lib/constants";

interface SettlementResult {
  id: string;
  symbol: string;
  icon: string;
  profit: number;
  won: boolean;
}

export function SettlementNotifier() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const checked = useRef(false);

  useEffect(() => {
    if (!session || checked.current) return;
    checked.current = true;

    async function checkResults() {
      try {
        const res = await fetch("/api/user/unseen-results", {
          credentials: "include",
        });
        const data = await res.json();
        if (!data.results || data.results.length === 0) return;

        const results: SettlementResult[] = data.results;
        const ids = results.map((r) => r.id);

        // Show toasts with staggered delay
        results.slice(0, 5).forEach((result, i) => {
          setTimeout(() => {
            if (result.won) {
              showToast(
                "success",
                `${result.icon} ${result.symbol} 結算：你贏了！`,
                `+${formatChips(result.profit)} 籌碼`
              );
            } else {
              showToast(
                "error",
                `${result.icon} ${result.symbol} 結算`,
                `${formatChips(result.profit)} 籌碼`
              );
            }
          }, i * 800);
        });

        // Mark all as seen
        await fetch("/api/user/mark-seen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ positionIds: ids }),
        });
      } catch {
        // Silently fail — not critical
      }
    }

    // Small delay to let the page load first
    const timer = setTimeout(checkResults, 1500);
    return () => clearTimeout(timer);
  }, [session, showToast]);

  return null;
}
