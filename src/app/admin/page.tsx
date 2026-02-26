"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Search, Coins, Users, History, Gift, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatChips } from "@/lib/constants";

interface AdminUser {
  id: string;
  clerk_id: string;
  username: string | null;
  avatar_url: string | null;
  chips_balance: number;
  total_trades: number;
  wins: number;
  losses: number;
  is_admin: boolean;
  created_at: string;
}

interface GrantRecord {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  amount: number;
  note: string | null;
  created_at: string;
}

export default function AdminPage() {
  const { isSignedIn } = useUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [history, setHistory] = useState<GrantRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  // Grant dialog state
  const [grantTarget, setGrantTarget] = useState<AdminUser | null>(null);
  const [grantAmount, setGrantAmount] = useState("");
  const [grantNote, setGrantNote] = useState("");
  const [granting, setGranting] = useState(false);

  // Grant-all dialog state
  const [showGrantAll, setShowGrantAll] = useState(false);
  const [grantAllAmount, setGrantAllAmount] = useState("");
  const [grantAllNote, setGrantAllNote] = useState("");
  const [grantingAll, setGrantingAll] = useState(false);

  const fetchUsers = useCallback(async (q: string) => {
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}`, {
      credentials: "include",
    });
    if (res.status === 403) {
      setForbidden(true);
      return;
    }
    const data = await res.json();
    setUsers(data.users || []);
  }, []);

  const fetchHistory = useCallback(async () => {
    const res = await fetch("/api/admin/grant-history", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setHistory(data.history || []);
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    Promise.all([fetchUsers(""), fetchHistory()]).then(() => setLoading(false));
  }, [isSignedIn, fetchUsers, fetchHistory]);

  const handleSearch = () => {
    fetchUsers(search);
  };

  const handleGrant = async () => {
    if (!grantTarget || !grantAmount) return;
    setGranting(true);
    const res = await fetch("/api/admin/grant-chips", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: grantTarget.id,
        amount: parseInt(grantAmount),
        note: grantNote || undefined,
      }),
    });
    if (res.ok) {
      setGrantTarget(null);
      setGrantAmount("");
      setGrantNote("");
      fetchUsers(search);
      fetchHistory();
    }
    setGranting(false);
  };

  const handleGrantAll = async () => {
    if (!grantAllAmount || !grantAllNote) return;
    setGrantingAll(true);
    const res = await fetch("/api/admin/grant-all", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseInt(grantAllAmount),
        note: grantAllNote,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      alert(`成功發放給 ${data.granted} 位用戶，每人 ${formatChips(data.amount)} 籌碼`);
      setShowGrantAll(false);
      setGrantAllAmount("");
      setGrantAllNote("");
      fetchUsers(search);
      fetchHistory();
    }
    setGrantingAll(false);
  };

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        請先登入
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="flex items-center justify-center py-20 text-red-400">
        無權限存取管理後台
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">管理後台</h1>
        <Button
          onClick={() => setShowGrantAll(true)}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Gift className="h-4 w-4 mr-2" />
          全員發放
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-secondary mb-6">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-1.5" />
            用戶管理 ({users.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-1.5" />
            發放紀錄
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {/* Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋用戶名稱..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              搜尋
            </Button>
          </div>

          {/* User list */}
          <div className="space-y-2">
            {users.map((u) => (
              <Card key={u.id} className="p-4 border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                        {(u.username || "?")[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {u.username || "匿名"}
                        </span>
                        {u.is_admin && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                            管理員
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()} | 交易 {u.total_trades} 筆
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="font-semibold">
                          {formatChips(u.chips_balance)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setGrantTarget(u);
                        setGrantAmount("");
                        setGrantNote("");
                      }}
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      發放
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          {history.length === 0 ? (
            <Card className="p-8 text-center border-border/50">
              <p className="text-muted-foreground">還沒有發放紀錄</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <Card key={h.id} className="p-4 border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {h.avatar_url ? (
                        <img
                          src={h.avatar_url}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                          {(h.username || "?")[0]}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-sm">
                          {h.username || "匿名"}
                        </span>
                        {h.note && (
                          <p className="text-xs text-muted-foreground">{h.note}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-semibold">
                        +{formatChips(h.amount)}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Grant dialog - single user */}
      {grantTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 border-border/50 mx-4">
            <h3 className="text-lg font-bold mb-4">
              發放籌碼給 {grantTarget.username || "匿名"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              目前餘額：{formatChips(grantTarget.chips_balance)} 籌碼
            </p>

            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1 block">金額</label>
              <Input
                type="number"
                placeholder="輸入籌碼數量"
                value={grantAmount}
                onChange={(e) => setGrantAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-2 mb-4">
              {[10000, 50000, 100000, 500000].map((q) => (
                <button
                  key={q}
                  onClick={() => setGrantAmount(String(q))}
                  className="flex-1 py-2 rounded-lg bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {q >= 10000 ? `${q / 10000}萬` : formatChips(q)}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1 block">備註（選填）</label>
              <Input
                placeholder="發放原因"
                value={grantNote}
                onChange={(e) => setGrantNote(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setGrantTarget(null)}
              >
                取消
              </Button>
              <Button
                className="flex-1"
                disabled={!grantAmount || parseInt(grantAmount) <= 0 || granting}
                onClick={handleGrant}
              >
                {granting ? "發放中..." : `發放 ${grantAmount ? formatChips(parseInt(grantAmount)) : 0} 籌碼`}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Grant-all dialog */}
      {showGrantAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 border-border/50 mx-4">
            <h3 className="text-lg font-bold mb-2">
              <Gift className="h-5 w-5 inline mr-2 text-amber-400" />
              全員發放籌碼
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              將發放給所有 {users.length} 位用戶
            </p>

            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1 block">每人金額</label>
              <Input
                type="number"
                placeholder="輸入籌碼數量"
                value={grantAllAmount}
                onChange={(e) => setGrantAllAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-2 mb-4">
              {[10000, 50000, 100000, 500000].map((q) => (
                <button
                  key={q}
                  onClick={() => setGrantAllAmount(String(q))}
                  className="flex-1 py-2 rounded-lg bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {q >= 10000 ? `${q / 10000}萬` : formatChips(q)}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1 block">
                發放原因（必填）
              </label>
              <Input
                placeholder="例：新年特別禮物"
                value={grantAllNote}
                onChange={(e) => setGrantAllNote(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowGrantAll(false)}
              >
                取消
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                disabled={
                  !grantAllAmount ||
                  parseInt(grantAllAmount) <= 0 ||
                  !grantAllNote.trim() ||
                  grantingAll
                }
                onClick={handleGrantAll}
              >
                {grantingAll
                  ? "發放中..."
                  : `全員發放 ${grantAllAmount ? formatChips(parseInt(grantAllAmount)) : 0}`}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
