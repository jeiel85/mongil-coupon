# 🤖 Gemini CLI & 개발 지침

이 파일은 프로젝트의 핵심 규정 및 지침을 담고 있습니다. 모든 작업은 아래 지침을 최우선으로 준수해야 합니다.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 🛠 핵심 개발 및 워크플로우 지침

### 1. 세션 시작 및 소스 최신화
- 새로운 작업을 시작하기 전, 반드시 원격 저장소의 최신 상태를 반영해야 합니다.
- **명령어**: `git pull --rebase origin master`

### 2. 로컬 커밋 및 리모트 푸시
- 로컬 커밋만으로는 배포 및 협업에 의미가 없습니다.
- 기능 구현 또는 수정이 완료되면 지체 없이 원격 저장소에 반영해야 합니다.
- **명령어**: `git push origin master`

### 3. 이력 관리 (`HISTORY.md`)
- 소스 수정, 빌드, 커밋, 푸시 등의 중요한 변화가 발생할 때마다 `HISTORY.md` 파일을 실시간으로 갱신합니다.
- 변경 사항의 목적과 결과(배포 여부 등)를 명확히 기록하여 프로젝트의 방향성을 유지합니다.

### 4. 코드 스타일 및 보안
- 모든 답변과 커밋 메시지는 **한글**을 기본으로 합니다.
- 환경 변수(`.env`) 및 민감한 정보는 절대 커밋하지 않습니다.

---
마지막 업데이트: 2026-04-27
