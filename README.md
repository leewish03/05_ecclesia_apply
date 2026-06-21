# 제 5회 동기모임 신청 사이트

운영용 신청 폼 웹사이트입니다. Render에서 Node 서버로 실행되고, Supabase에는 서버가 `service_role` 키로만 접근합니다.

## 로컬 실행

Supabase 없이 화면과 흐름만 확인하려면:

```powershell
$env:USE_MEMORY_STORE="true"
$env:ADMIN_ACCESS_CODE="demo-code"
$env:PORT="4173"
npm.cmd start
```

접속:

- 신청 페이지: `http://localhost:4173`
- 관리자 페이지: `http://localhost:4173/admin.html`

## Supabase 설정

Supabase SQL Editor에서 [supabase/schema.sql](./supabase/schema.sql)을 실행하세요.

생성되는 테이블:

- `public.registrations`

RLS는 켜져 있고 public 정책은 만들지 않습니다. 브라우저가 Supabase에 직접 접근하지 않고 Render 서버만 접근합니다.

## Render 설정

`render.yaml`을 사용해 Web Service를 만들고 아래 환경변수를 설정하세요.

- `SUPABASE_URL`: Supabase Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `ADMIN_ACCESS_CODE`: 관리자 페이지 조회 코드

Render 실행 명령:

```bash
npm start
```

헬스체크:

```text
/api/health
```

## 기능

- 신청 폼 제출
- 계좌번호 복사: `3333334743437`
- 전화번호 숫자 입력 및 자동 하이픈 표시
- 기존 신청자의 이름/소속교회 공개 조회
- 관리자 코드로 전체 응답 조회

## 테스트

```powershell
npm.cmd test
```
