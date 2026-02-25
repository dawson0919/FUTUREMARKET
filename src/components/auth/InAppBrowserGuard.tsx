"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || "";
  // LINE, Facebook, Instagram, WeChat, Twitter, etc.
  return /FBAN|FBAV|Instagram|Line\/|LIFF|MicroMessenger|Twitter|Snapchat|BytedanceWebview|TikTok/i.test(ua);
}

export function InAppBrowserGuard({ children }: { children: React.ReactNode }) {
  const [inApp, setInApp] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  if (!inApp) return <>{children}</>;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenExternal = () => {
    // Try intent for Android Chrome
    const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center space-y-5">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold">無法在應用內瀏覽器登入</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Google 登入不支援 LINE、Facebook、Instagram 等應用內瀏覽器。
            <br />
            請使用 <strong className="text-foreground">Chrome</strong> 或 <strong className="text-foreground">Safari</strong> 開啟此頁面。
          </p>
        </div>

        <div className="space-y-3">
          {/* Step instructions */}
          <div className="rounded-lg bg-secondary p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">操作步驟</p>
            <ol className="text-sm space-y-1.5 list-decimal list-inside text-muted-foreground">
              <li>點擊下方 <strong className="text-foreground">複製連結</strong></li>
              <li>開啟 <strong className="text-foreground">Chrome</strong> 或 <strong className="text-foreground">Safari</strong></li>
              <li>在網址列貼上連結並前往</li>
            </ol>
          </div>

          <Button onClick={handleCopy} className="w-full gap-2" variant="default">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                已複製！
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                複製連結
              </>
            )}
          </Button>

          <Button onClick={handleOpenExternal} variant="outline" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            嘗試用外部瀏覽器開啟
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          如仍無法登入，請直接在瀏覽器輸入網址前往
        </p>
      </div>
    </div>
  );
}
