"use client";

import { signIn } from "next-auth/react";
import { InAppBrowserGuard } from "@/components/auth/InAppBrowserGuard";

export default function SignUpPage() {
  return (
    <InAppBrowserGuard>
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 space-y-6 text-center">
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6d5dfc] to-[#4338ca]">
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                  <path d="M8 36L18 26L26 32L40 14" stroke="#4ade80" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M34 12L42 13L41 21" stroke="#4ade80" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold">加入 The Future Market</h1>
            <p className="text-sm text-muted-foreground">使用 Google 帳號即可免費加入</p>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            使用 Google 帳號登入 / 註冊
          </button>
        </div>
      </div>
    </InAppBrowserGuard>
  );
}
