"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Code, RedeemResult, RedeemStatus } from "@/lib/schemas";
import Image from "next/image";

interface Props {
  code: Code;
  status: RedeemStatus;
  result?: RedeemResult;
}

const STATUS_CONFIG: Record<
  RedeemStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  idle: { label: "대기중", variant: "outline" },
  pending: { label: "진행중...", variant: "secondary" },
  success: { label: "등록 완료 ✓", variant: "default" },
  already_redeemed: { label: "이미 등록됨", variant: "secondary" },
  invalid_code: { label: "잘못된 코드", variant: "destructive" },
  expired: { label: "만료됨", variant: "destructive" },
  error: { label: "오류", variant: "destructive" },
};

export function CodeResultRow({ code, status, result }: Props) {
  const cfg = STATUS_CONFIG[status];
  const isExpiredByDate =
    code.expiresAt && new Date(code.expiresAt) < new Date();

  return (
    <TableRow className={isExpiredByDate ? "opacity-50" : ""}>
      <TableCell className="font-mono font-semibold">{code.code}</TableCell>
      <TableCell className="text-sm text-muted-foreground max-w-48">
        {code.reward}
      </TableCell>
      <TableCell className="text-sm">
        {code.issuedAt ?? <span className="text-muted-foreground">-</span>}
      </TableCell>
      <TableCell className="text-sm">
        {code.expiresAt ? (
          <span className={isExpiredByDate ? "text-destructive" : ""}>
            {code.expiresAt}
          </span>
        ) : (
          <span className="text-muted-foreground">미확인</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </TableCell>
      <TableCell>
        {status === "success" && result?.images && result.images.length > 0 && (
          <div className="flex gap-1">
            {result.images.slice(0, 3).map((src, i) => (
              <Image
                key={i}
                src={src}
                alt="보상 아이템"
                width={36}
                height={36}
                className="rounded object-cover"
                unoptimized
              />
            ))}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
