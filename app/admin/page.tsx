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

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setSuggestions([]);
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-muted/30 px-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 메인으로 돌아가기
        </Link>
        <Card className="w-full max-w-sm shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">관리자 로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pw">비밀번호</Label>
                <Input
                  id="pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
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
    <div className="min-h-screen bg-muted/30">
      {/* 헤더 */}
      <div className="border-b bg-background">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 메인
            </Link>
            <span className="text-muted-foreground/40">|</span>
            <h1 className="text-sm font-semibold">코드 제안 관리</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSuggestions}
              disabled={loading}
            >
              새로고침
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {/* 제안 수 요약 */}
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {suggestions.length > 0
              ? `대기 중인 제안 ${suggestions.length}건`
              : "대기 중인 제안이 없습니다."}
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
            <span className="animate-spin">⟳</span>
            불러오는 중...
          </div>
        )}

        {/* 제안 카드 목록 */}
        <div className="space-y-3">
          {suggestions.map((s) => (
            <Card key={s.id} className="shadow-sm">
              <CardContent className="p-5">
                {/* 상단: 코드명 + 뱃지 + 날짜 */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono font-bold text-base tracking-wide truncate">
                      {s.code}
                    </span>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {s.voteCount}표
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(s.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>

                {/* 보상 정보 */}
                {s.reward ? (
                  <p className="text-sm text-muted-foreground mb-4">
                    보상: {s.reward}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/50 mb-4">
                    보상 정보 없음
                  </p>
                )}

                {/* 하단: 액션 버튼 */}
                <div className="flex items-center gap-2 pt-1 border-t">
                  {actionMsg[s.id] ? (
                    <span className="text-sm text-muted-foreground py-1">
                      {actionMsg[s.id]}
                    </span>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleAction(s.id, "approve")}
                      >
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                        onClick={() => handleAction(s.id, "reject")}
                      >
                        거부
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
