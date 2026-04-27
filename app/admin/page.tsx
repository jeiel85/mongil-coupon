"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SuggestionRecord } from "@/lib/schemas";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<SuggestionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<Record<string, string>>({});

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suggestions");
      if (res.ok) setSuggestions(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) loadSuggestions();
  }, [loggedIn, loadSuggestions]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setLoggedIn(true);
        setPassword("");
      } else {
        const data = (await res.json()) as { error?: string };
        setLoginError(data.error ?? "로그인 실패");
      }
    } catch {
      setLoginError("네트워크 오류");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionMsg((prev) => ({ ...prev, [id]: "처리 중..." }));
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      setActionMsg((prev) => ({
        ...prev,
        [id]: data.message ?? data.error ?? "완료",
      }));
      if (res.ok) {
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      setActionMsg((prev) => ({ ...prev, [id]: "오류 발생" }));
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 메인으로 돌아가기
        </Link>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>관리자 로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="pw">비밀번호</Label>
                <Input
                  id="pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "확인 중..." : "로그인"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            ← 메인으로 돌아가기
          </Link>
          <h1 className="text-xl font-bold">코드 제안 관리</h1>
        </div>
        <Button variant="outline" size="sm" onClick={loadSuggestions} disabled={loading}>
          새로고침
        </Button>
      </div>

      {loading && <p className="text-muted-foreground text-sm">불러오는 중...</p>}

      {!loading && suggestions.length === 0 && (
        <p className="text-muted-foreground text-sm">대기 중인 제안이 없습니다.</p>
      )}

      <div className="space-y-3">
        {suggestions.map((s) => (
          <Card key={s.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono font-semibold">{s.code}</span>
                <Badge variant="outline">{s.voteCount}표</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(s.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              {s.reward && (
                <p className="text-sm text-muted-foreground">보상: {s.reward}</p>
              )}
              <div className="flex gap-2 pt-1 flex-wrap">
                <Button size="sm" onClick={() => handleAction(s.id, "approve")}>
                  승인
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(s.id, "reject")}
                >
                  거부
                </Button>
                {actionMsg[s.id] && (
                  <span className="text-sm text-muted-foreground self-center">
                    {actionMsg[s.id]}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
