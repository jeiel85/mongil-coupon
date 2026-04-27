<div align="center">

# 🎮 몬길 쿠폰 자동 입력기

**넷마블 몬스터길들이기 쿠폰을 한 번에 자동 등록해드립니다**

[**라이브 데모 →**](https://mongil-coupon.vercel.app)

<br/>

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jeiel85/mongil-coupon)

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| ⚡ **일괄 자동 등록** | 회원번호(PID)만 입력하면 등록 가능한 모든 쿠폰 코드를 자동으로 순차 등록 |
| 📊 **실시간 결과 확인** | 각 코드의 성공/실패/이미사용 여부를 즉시 시각적으로 피드백 |
| 🔍 **커스텀 코드 직접 입력** | 리스트에 없는 쿠폰 코드도 직접 입력해 즉시 등록 가능 |
| 💡 **쿠폰 코드 제안** | 새로운 쿠폰 코드를 커뮤니티에 제보하면 검토 후 반영 |
| 🔐 **관리자 패널** | 제안된 코드의 검토·승인·거절 및 코드 관리 |
| 👥 **방문자 카운터** | 누적 방문자 수 실시간 집계 |

## 🎯 사용 방법

> 별도 회원가입 없이 **PID(회원번호)** 하나만 있으면 바로 사용 가능합니다.

1. [라이브 사이트](https://mongil-coupon.vercel.app)에 접속합니다
2. 넷마블 [쿠폰 페이지](https://coupon.netmarble.com/monster2)에서 PID를 확인합니다
3. PID를 입력하고 **전체 시도** 버튼을 클릭합니다
4. 결과를 확인합니다 ✅

## 🛠️ 기술 스택

```
Frontend   Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui
Backend    Next.js API Routes · Zod · JOSE (JWT)
Database   Vercel KV (Redis)
Deploy     Vercel (Fluid Compute)
```

## 🚀 로컬 개발 환경 세팅

```bash
# 레포지토리 클론
git clone https://github.com/jeiel85/mongil-coupon.git
cd mongil-coupon

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 편집 후 아래 변수 입력

# 개발 서버 실행
npm run dev
```

`http://localhost:3000`으로 접속합니다.

### 환경 변수

| 변수 | 설명 | 필수 |
|------|------|:----:|
| `KV_REST_API_URL` | Vercel KV REST API URL | ✅ |
| `KV_REST_API_TOKEN` | Vercel KV REST API 토큰 | ✅ |
| `ADMIN_PASSWORD` | 관리자 페이지 비밀번호 | ✅ |
| `JWT_SECRET` | JWT 토큰 서명용 시크릿 키 | ✅ |

> **Vercel KV 없이 로컬 테스트하려면?** [Vercel 대시보드](https://vercel.com/dashboard)에서 KV 스토어를 생성하거나, `vercel env pull .env.local`로 환경 변수를 자동으로 받아올 수 있습니다.

## 📁 프로젝트 구조

```
mongil-coupon/
├── app/
│   ├── api/
│   │   ├── codes/          # 쿠폰 코드 목록 조회
│   │   ├── redeem/         # 쿠폰 등록 처리
│   │   ├── suggestions/    # 코드 제안 접수
│   │   ├── visitors/       # 방문자 수 집계
│   │   └── admin/          # 관리자 API (로그인·승인)
│   ├── admin/              # 관리자 페이지
│   ├── icon.tsx            # 동적 파비콘
│   ├── opengraph-image.tsx # OG 이미지
│   └── page.tsx            # 메인 페이지
├── components/
│   ├── MainContent.tsx     # 페이지 레이아웃
│   ├── CodeRunner.tsx      # 일괄 등록 실행기
│   ├── CodeResultRow.tsx   # 결과 행 컴포넌트
│   ├── CustomCodeRunner.tsx# 커스텀 코드 입력기
│   ├── MemberNumberInput.tsx
│   ├── SuggestionForm.tsx
│   └── ui/                 # shadcn/ui 컴포넌트
├── lib/
│   ├── netmarble.ts        # 넷마블 쿠폰 API 클라이언트
│   ├── kv.ts               # Vercel KV 래퍼
│   ├── auth.ts             # JWT 인증 헬퍼
│   ├── ratelimit.ts        # Rate limiting
│   ├── schemas.ts          # Zod 스키마
│   └── utils.ts
└── data/
    └── codes.json          # 정적 쿠폰 코드 데이터
```

## 🎁 현재 등록 가능한 쿠폰 코드

> ⚠️ 쿠폰 코드는 유효기간이 있으며 언제든 만료될 수 있습니다. 최신 목록은 [라이브 사이트](https://mongil-coupon.vercel.app)를 확인하세요.

<details>
<summary>코드 목록 펼치기</summary>

| 코드 | 보상 |
|------|------|
| `LOVEMONGIL` | 아티팩트: 넘쳐흐르는 사랑 |
| `MONGILDISCORD` | 별빛 수정 ×30, 은은한 별빛 가루 ×3, 골드 ×300,000 |
| `devlive0410` | 몬스터링 3종 (스카, 하얀늑대, 슬라릿) |
| `DINDINISDINDIN` | 몬스터링 1종 (쵸파), 골드 ×10,000 |
| `MONGILPRESENT` | 몬스터링 3종 (쵸푸, 포크머거, 슬라릿) |
| `MONGILREPORT` | 몬스터링 1종 (하얀 늑대) |
| `GSBGMONGIL` | 몬스터링 1종 (쵸푸엉클), 골드 ×10,000 |
| `LETS` | 몬스터링 1종 (고블린 훈련병) |
| `PLAY` | 몬스터링 1종 (왕소라뇽) |
| `PLAYMONGIL` | 몬스터링 1종 (슬라링) |
| `JOINMONGIL` | 몬스터링 1종 (도라뿅) |
| `MEMOLMONGIL` | 미확인 |

</details>

## 🤝 기여하기

새로운 쿠폰 코드를 발견하셨나요? 두 가지 방법으로 기여할 수 있습니다.

**방법 1 — 사이트에서 직접 제보** (추천)

사이트 하단의 **쿠폰 코드 제안** 폼을 통해 제보해주세요. 관리자가 검토 후 반영합니다.

**방법 2 — Pull Request**

`data/codes.json`에 아래 형식으로 추가 후 PR을 열어주세요.

```json
{
  "code": "NEWCODE123",
  "reward": "보상 설명",
  "addedAt": "YYYY-MM-DD",
  "issuedAt": null,
  "expiresAt": null,
  "status": "active",
  "source": "official"
}
```

## ⚠️ 면책 조항

이 프로젝트는 넷마블의 공식 서비스가 아닙니다. 넷마블 및 몬스터길들이기와 공식적인 관계가 없으며, 공개된 쿠폰 등록 API를 활용하는 비공식 편의 도구입니다. 서비스 이용 중 발생하는 모든 문제에 대한 책임은 사용자 본인에게 있습니다.

## 📄 라이선스

[MIT License](LICENSE) © 2026

---

<div align="center">

Made with ❤️ for 몬길 유저들

[라이브 데모](https://mongil-coupon.vercel.app) · [쿠폰 제보하기](https://mongil-coupon.vercel.app) · [버그 신고](https://github.com/jeiel85/mongil-coupon/issues)

</div>
