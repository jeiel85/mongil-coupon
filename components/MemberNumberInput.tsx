"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "mongil_member_no";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function MemberNumberInput({ value, onChange }: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) onChange(saved);
      } catch {}
      setLoaded(true);
    });
  }, [onChange]);

  const handleChange = (v: string) => {
    onChange(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {}
  };

  const isValid = /^[A-F0-9]{32}$/i.test(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="member-no">회원번호 (PID)</Label>
      <Input
        id="member-no"
        value={loaded ? value : ""}
        onChange={(e) => handleChange(e.target.value.trim())}
        placeholder="32자리 영문/숫자 (쿠폰 페이지에서 확인)"
        className={`font-mono ${value && !isValid ? "border-destructive" : ""}`}
        maxLength={32}
      />
      {value && !isValid && (
        <p className="text-sm text-destructive">
          회원번호는 32자리 영문/숫자입니다. 쿠폰 페이지에서 확인해 주세요.
        </p>
      )}
      {isValid && (
        <p className="text-sm text-muted-foreground">✓ 자동 저장됨</p>
      )}
    </div>
  );
}
