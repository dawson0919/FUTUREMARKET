"use client";

import { Gift, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ChipRequestCard() {
  return (
    <Card className="border-border/50 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
          <Gift className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base mb-2">
            免費領取 100,000 籌碼
          </h3>
          <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>
              透過連結註冊{" "}
              <a
                href="https://reurl.cc/oKAgxg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline underline-offset-2 inline-flex items-center gap-1"
              >
                派網 Pionex 交易平台
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>完成 KYC 身分驗證</li>
            <li>聯繫小編並提供您的 EMAIL 帳號</li>
            <li>管理員確認後將發放 100,000 籌碼</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}
