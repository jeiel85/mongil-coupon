"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RedeemResult, RedeemStatus } from "@/lib/schemas";

interface Props {
  memberNo: string;
}

const STATUS_CONFIG: Partial<
  Record<
    RedeemStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  >
> = {
  pending: { label: "처리중...", variant: "secondary" },
  success: { label: "등록 완료 ✓", variant: "default" },
  already_redeemed: { label: "이미 등록됨", variant: "secondary" },
  invalid_code: { label: "잘못된 코드", variant: "destructive" },
  expired: { label: "만료됨", variant: "destructive" },
  error: { label: "오류", variant: "destructive" },
};

export function CustomCodeRunner({ memberNo }: Props) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<RedeemStatus | null>(null);
  const [message, setMessage] = useState("");
  const [autoAdded, setAutoAdded] = useState(false);
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    const trimmed = code.trim();
    if (!memberNo || !trimmed || running) return;
    setRunning(true);
    setStatus("pending");
    setMessage("");
    setAutoAdded(false);

    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberNo, code: trimmed }),
      });
      const result: RedeemResult = await res.json();
      setStatus(result.status);
      setMessage(result.message ?? "");

      if (result.status === "success" || result.status === "already_redeemed") {
        const addRes = await fetch("/api/codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: trimmed }),
        });
        if (addRes.ok) {
          const data = (await addRes.json()) as { added: boolean };
          setAutoAdded(data.added);
        }
      }
    } catch {
      setStatus("error");
    } finally {
      setRunning(false);
    }
  };

  const cfg = status ? STATUS_CONFIG[status] : null;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold">직접 코드 입력</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          목록에 없는 코드를 직접 시도해보세요. 유효하면 자동으로 목록에 추가됩니다.
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          className="font-mono max-w-64"
          placeholder="리딤 코드"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRun()}
          disabled={running}
        />
        <Button
          onClick={handleRun}
          disabled={running || !memberNo || !code.trim()}
        >
          {running ? "처리중..." : "시도"}
        </Button>
      </div>
      {cfg && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
          {message && (
            <span className="text-xs text-muted-foreground">{message}</span>
          )}
          {autoAdded && (
            <span className="text-xs text-green-600 dark:text-green-400">
              목록에 추가되었습니다
            </span>
          )}
        </div>
      )}
    </div>
  );
}
