"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MemberNumberInput } from "./MemberNumberInput";
import { CodeRunner } from "./CodeRunner";
import { CustomCodeRunner } from "./CustomCodeRunner";
import { SuggestionForm } from "./SuggestionForm";
import type { Code } from "@/lib/schemas";

interface Props {
  codes: Code[];
}

export function MainContent({ codes }: Props) {
  const [memberNo, setMemberNo] = useState("");
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/visitors", { method: "POST" })
      .then((r) => r.json())
      .then((d: { count: number }) => setVisitors(d.count))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
          <h1 className="text-xl sm:text-2xl font-bold">몬길 쿠폰 자동 입력기</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            회원번호를 입력하고 <strong>전체 시도</strong>를 누르면 모든 공개 쿠폰코드를 자동으로 등록합니다.
          </p>
          </div>
          <Link
            href="/admin"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
          >
            관리자
          </Link>
        </div>

        <div className="w-full max-w-md">
          <MemberNumberInput value={memberNo} onChange={setMemberNo} />
          <p className="text-xs text-muted-foreground mt-2">
            회원번호(PID)는{" "}
            <a
              href="https://coupon.netmarble.com/monster2"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              쿠폰 페이지
            </a>
            에서 확인하세요.
          </p>
        </div>

        <CodeRunner codes={codes} memberNo={memberNo} />

        <div className="w-full max-w-md">
          <CustomCodeRunner memberNo={memberNo} />
        </div>

        <div className="w-full max-w-md">
          <SuggestionForm />
        </div>

        <footer className="border-t pt-6 space-y-1">
          <p className="text-xs text-muted-foreground">
            ⚠️ 이 서비스는 넷마블의 공식 서비스가 아닙니다. 사용 중 발생하는 모든 문제에 대한 책임은 사용자 본인에게 있습니다.
          </p>
          <p className="text-xs text-muted-foreground">
            쿠폰 코드는 공개된 정보를 기반으로 등록되며, 유효기간이 지난 코드는 사용이 불가할 수 있습니다.
          </p>
          {visitors !== null && (
            <p className="text-xs text-muted-foreground">
              누적 방문자 {visitors.toLocaleString()}명
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
