"use client";

import { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CodeResultRow } from "./CodeResultRow";
import type { Code, RedeemResult, RedeemStatus } from "@/lib/schemas";

interface CodeState {
  status: RedeemStatus;
  result?: RedeemResult;
}

function jitter(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function cacheKey(memberNo: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `mongil_results_${date}_${memberNo.slice(0, 8)}`;
}

function loadCache(memberNo: string): Record<string, RedeemResult> {
  try {
    const raw = localStorage.getItem(cacheKey(memberNo));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(memberNo: string, cache: Record<string, RedeemResult>) {
  try {
    localStorage.setItem(cacheKey(memberNo), JSON.stringify(cache));
  } catch {}
}

const TERMINAL_STATUSES = new Set([
  "success",
  "already_redeemed",
  "invalid_code",
  "expired",
]);

interface Props {
  codes: Code[];
  memberNo: string;
}

export function CodeRunner({ codes, memberNo }: Props) {
  const [states, setStates] = useState<Record<string, CodeState>>(() => {
    const cache = loadCache(memberNo);
    return Object.fromEntries(
      codes.map((c) => [
        c.code,
        cache[c.code]
          ? { status: cache[c.code].status as RedeemStatus, result: cache[c.code] }
          : { status: "idle" as RedeemStatus },
      ])
    );
  });
  const [running, setRunning] = useState(false);

  const runAll = useCallback(async () => {
    if (!memberNo || running) return;
    setRunning(true);
    const cache = loadCache(memberNo);

    for (const code of codes) {
      const cached = cache[code.code];
      if (cached && TERMINAL_STATUSES.has(cached.status)) continue;

      setStates((prev) => ({ ...prev, [code.code]: { status: "pending" } }));

      try {
        const res = await fetch("/api/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberNo, code: code.code }),
        });
        const result: RedeemResult = await res.json();
        cache[code.code] = result;
        saveCache(memberNo, cache);
        setStates((prev) => ({
          ...prev,
          [code.code]: { status: result.status, result },
        }));
      } catch {
        setStates((prev) => ({
          ...prev,
          [code.code]: { status: "error" },
        }));
      }

      await new Promise((r) => setTimeout(r, jitter(800, 1200)));
    }

    setRunning(false);
  }, [codes, memberNo, running]);

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(cacheKey(memberNo));
    } catch {}
    setStates(
      Object.fromEntries(
        codes.map((c) => [c.code, { status: "idle" as RedeemStatus }])
      )
    );
  }, [codes, memberNo]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={runAll} disabled={running || !memberNo}>
          {running ? "진행중..." : "전체 시도"}
        </Button>
        <Button variant="outline" onClick={resetAll} disabled={running}>
          초기화
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>쿠폰 코드</TableHead>
              <TableHead>보상</TableHead>
              <TableHead>발행일</TableHead>
              <TableHead>만료일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>보상 이미지</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((code) => (
              <CodeResultRow
                key={code.code}
                code={code}
                status={states[code.code]?.status ?? "idle"}
                result={states[code.code]?.result}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
