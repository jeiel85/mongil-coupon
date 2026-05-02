"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Code, RedeemStatus } from "@/lib/schemas";

interface Props {
  code: Code;
  status: RedeemStatus;
  index: number;
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

export function CodeResultRow({ code, status, index }: Props) {
  const cfg = STATUS_CONFIG[status];
  const isExpiredByDate =
    code.expiresAt && new Date(code.expiresAt) < new Date();

  return (
    <TableRow className={isExpiredByDate ? "opacity-50" : ""}>
      <TableCell className="text-xs text-muted-foreground font-mono">{index}</TableCell>
      <TableCell className="font-mono font-semibold text-sm">{code.code}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{code.reward}</TableCell>
      <TableCell>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </TableCell>
    </TableRow>
  );
}
