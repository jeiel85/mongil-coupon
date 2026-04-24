"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SuggestionForm() {
  const [code, setCode] = useState("");
  const [reward, setReward] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), reward: reward.trim() }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      setMessage({ text: data.message ?? data.error ?? "처리됨", ok: res.ok });
      if (res.ok) {
        setCode("");
        setReward("");
      }
    } catch {
      setMessage({ text: "네트워크 오류가 발생했습니다.", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">새 리딤코드 제안</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="suggest-code">쿠폰 코드 *</Label>
            <Input
              id="suggest-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예: MONGILEVENT"
              maxLength={64}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="suggest-reward">보상 내용 (선택)</Label>
            <Input
              id="suggest-reward"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="예: 몬스터링 1종"
              maxLength={200}
            />
          </div>
          {message && (
            <p className={`text-sm ${message.ok ? "text-green-600" : "text-destructive"}`}>
              {message.text}
            </p>
          )}
          <Button type="submit" variant="outline" disabled={loading || !code.trim()}>
            {loading ? "제출 중..." : "제안하기"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">
          동일한 코드가 일정 수 이상 제안되면 관리자가 검토 후 등록합니다.
        </p>
      </CardContent>
    </Card>
  );
}
