"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Gift, Flame, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-notification";
import { formatChips } from "@/lib/constants";
import { useUserProfile } from "@/lib/hooks";

function getRewardForStreak(streak: number): number {
  if (streak >= 30) return 20000;
  if (streak >= 7) return 5000;
  if (streak >= 3) return 2000;
  return 1000;
}

export function DailyCheckinBanner() {
  const { data: session } = useSession();
  const { profile, refreshProfile } = useUserProfile();
  const { showToast } = useToast();
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!profile) return;
    // Check if already checked in today (Taiwan time)
    const now = new Date();
    const tw = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const today = tw.toISOString().split("T")[0];
    if (profile.last_checkin_date === today) {
      setCheckedIn(true);
    }
    setStreak(profile.checkin_streak || 0);
  }, [profile]);

  if (!session || !profile) return null;

  async function handleCheckin() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/checkin", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === "success") {
        setCheckedIn(true);
        setStreak(data.streak);
        showToast(
          "reward",
          `簽到成功！+${formatChips(data.reward)} 籌碼`,
          `連續簽到 ${data.streak} 天`
        );
        await refreshProfile();
      } else if (data.status === "already_checked_in") {
        setCheckedIn(true);
        setStreak(data.streak);
      }
    } catch {
      showToast("error", "簽到失敗", "請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  const nextReward = getRewardForStreak(streak + 1);

  return (
    <Card className="border-border/50 overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {checkedIn ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
              <Gift className="h-5 w-5 text-yellow-400" />
            </div>
          )}
          <div>
            {checkedIn ? (
              <>
                <p className="text-sm font-semibold">今日已簽到</p>
                <p className="text-xs text-muted-foreground">
                  明日獎勵：{formatChips(nextReward)} 籌碼
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold">每日簽到領獎勵</p>
                <p className="text-xs text-muted-foreground">
                  今日可領：{formatChips(getRewardForStreak(streak + 1))} 籌碼
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak display */}
          {streak > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-400">
              <Flame className="h-4 w-4" />
              <span className="font-bold">{streak} 天</span>
            </div>
          )}

          {!checkedIn && (
            <Button
              size="sm"
              onClick={handleCheckin}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              {loading ? "簽到中..." : "領取獎勵"}
            </Button>
          )}
        </div>
      </div>

      {/* Streak milestones */}
      <div className="flex gap-0 border-t border-border/30">
        {[
          { days: 3, reward: 2000 },
          { days: 7, reward: 5000 },
          { days: 30, reward: 20000 },
        ].map((milestone) => (
          <div
            key={milestone.days}
            className={`flex-1 text-center py-2 text-xs border-r border-border/30 last:border-0 ${
              streak >= milestone.days
                ? "text-yellow-400 bg-yellow-500/5"
                : "text-muted-foreground"
            }`}
          >
            <span className="font-semibold">{milestone.days}天</span>
            <span className="mx-1">·</span>
            <span>{formatChips(milestone.reward)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
