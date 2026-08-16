<img width="2510" height="2155" alt="image" src="https://github.com/user-attachments/assets/6f05ecf0-62ae-496e-8866-599a2e45db38" />


# Lyrics Bilingual

영어 노래 가사와 한국어 번역을 나란히 보여주는 개인용 뷰어입니다. 곡을 검색하면 Genius에서 원문 가사를 가져와 줄 단위로 한국어 번역을 붙여서 보여줍니다.

## 기능

- **가사 검색**: 아티스트, 곡 제목, 또는 Spotify/YouTube 링크로 검색
- **영어·한국어 병렬 가사**: 원문과 번역을 나란히 보여주고, 번역만 블러로 가릴 수 있음
- **지금 재생 중** (선택 기능): Spotify에서 듣고 있는 곡을 자동으로 인식해서 홈 화면에 바로 가사를 띄움 (아래 [지금 재생 중 기능 설정](#지금-재생-중-기능-설정-선택) 참고)

## 시작하기

### 1. 준비물

- Node.js 20 이상
- PostgreSQL 데이터베이스 (무료로 쓰려면 [Neon](https://neon.tech) 추천)
- [Genius API](https://genius.com/api-clients) 클라이언트 액세스 토큰 (무료 발급)

### 2. 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env.local.example`을 복사해서 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.local.example .env.local
```

```
DATABASE_URL=       # PostgreSQL 접속 문자열 (Neon 대시보드에서 복사)
GENIUS_ACCESS_TOKEN= # Genius API 클라이언트 액세스 토큰
```

### 4. 데이터베이스 테이블 생성

```bash
npx drizzle-kit push
```

가사 캐시(`songs`)와 지금 재생 중 상태(`now_playing`) 테이블이 생성됩니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

## 사용법

1. 홈 화면 우측 상단 검색창에 아티스트/곡 제목을 입력하고 검색
2. 검색 결과 목록에서 원하는 곡 클릭
3. 영어 원문과 한국어 번역이 나란히 표시됨 — "한국어 가리기" 토글로 번역만 블러 처리 가능

## 지금 재생 중 기능 설정 (선택)

Spotify에서 재생 중인 곡을 자동으로 인식해서 홈 화면에 바로 가사를 띄워주는 기능입니다. Spotify 공식 API는 앱 소유자가 Premium이어야 동작하는 제약이 있어서, 대신 브라우저 유저스크립트로 재생 정보를 가져옵니다.

1. Chrome/Edge에 [Tampermonkey](https://www.tampermonkey.net/) 확장 프로그램 설치
2. Tampermonkey 대시보드 → 새 스크립트 추가
3. [`scripts/spotify-now-playing-reporter.user.js`](scripts/spotify-now-playing-reporter.user.js) 파일 내용을 그대로 붙여넣고 저장
   - 배포된 서버를 쓰는 경우, 스크립트 안의 `REPORT_URL`을 배포 주소로 수정해야 합니다 (기본값은 로컬 개발 서버용 `http://127.0.0.1:3000`)
4. `open.spotify.com`에서 곡 재생 → 홈 화면에 자동으로 가사가 뜸

이 기능은 스크립트를 설치한 본인 브라우저에서만 동작합니다.

## 기술 스택

- [Next.js](https://nextjs.org) (App Router)
- [Drizzle ORM](https://orm.drizzle.team) + [Neon](https://neon.tech) (PostgreSQL)
- [Genius API](https://genius.com/api-clients) (가사 검색/스크래핑)
- 구글 번역(비공식 무료 엔드포인트) (영→한 번역)
