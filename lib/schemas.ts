import { z } from "zod";

export const CodeSchema = z.object({
  code: z.string().min(1).max(64),
  reward: z.string(),
  addedAt: z.string(),
  issuedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  status: z.enum(["active", "expired", "unknown"]),
  source: z.enum(["official", "community"]),
});

export type Code = z.infer<typeof CodeSchema>;

export const RedeemRequestSchema = z.object({
  memberNo: z
    .string()
    .regex(/^[A-F0-9]{32}$/i, "회원번호 형식이 올바르지 않습니다 (32자 hex)"),
  code: z.string().min(1).max(64),
});

export type RedeemRequest = z.infer<typeof RedeemRequestSchema>;

export type RedeemStatus =
  | "idle"
  | "pending"
  | "success"
  | "already_redeemed"
  | "invalid_code"
  | "expired"
  | "error";

export const RedeemResultSchema = z.object({
  code: z.string(),
  status: z.enum([
    "success",
    "already_redeemed",
    "invalid_code",
    "expired",
    "error",
  ]),
  message: z.string(),
  images: z.array(z.string()).optional(),
  reward: z.string().optional(),
});

export type RedeemResult = z.infer<typeof RedeemResultSchema>;

export const SuggestionSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(64)
    .transform((v) => v.trim().toUpperCase()),
  reward: z.string().max(200).optional().default(""),
});

export type SuggestionInput = z.infer<typeof SuggestionSchema>;

export interface SuggestionRecord {
  id: string;
  code: string;
  reward: string;
  status: "pending" | "approved" | "rejected";
  voteCount: number;
  createdAt: string;
}
