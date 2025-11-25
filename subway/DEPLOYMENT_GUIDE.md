# 배포 가이드

이 문서는 서울 지하철 혼잡도 앱을 배포하는 방법을 안내합니다.

## 📋 배포 전 체크리스트

### 1. 환경 변수 확인
- [ ] `.env.local` 파일에 필요한 API 키가 설정되어 있는지 확인
- [ ] 프로덕션 환경 변수 준비

### 2. 빌드 테스트
```bash
npm run build
```
빌드가 성공적으로 완료되는지 확인하세요.

### 3. 필수 파일 확인
- [ ] `subway_passengers.csv` 파일 존재 확인
- [ ] 모든 의존성이 설치되어 있는지 확인

---

## 🚀 배포 방법

### 방법 1: Vercel (권장 - 가장 간단)

Vercel은 Next.js를 만든 회사에서 제공하는 플랫폼으로, Next.js 프로젝트 배포에 최적화되어 있습니다.

#### 1단계: Vercel 계정 생성
1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인

#### 2단계: 프로젝트 배포
1. Vercel 대시보드에서 "Add New Project" 클릭
2. GitHub 저장소 선택 또는 수동 업로드
3. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `subway` (또는 프로젝트 루트)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install`

#### 3단계: 환경 변수 설정
Vercel 대시보드에서 환경 변수 추가:
- `NEXT_PUBLIC_SEOUL_API_KEY`: 서울시 공공데이터 API 키
- `NAVER_CLIENT_ID`: 네이버 지도 API Client ID (선택사항)
- `NAVER_CLIENT_SECRET`: 네이버 지도 API Secret (선택사항)

#### 4단계: 배포
- "Deploy" 버튼 클릭
- 배포 완료 후 자동으로 URL 제공 (예: `your-project.vercel.app`)

#### 장점
- ✅ 무료 플랜 제공
- ✅ 자동 HTTPS
- ✅ 자동 배포 (Git push 시)
- ✅ 글로벌 CDN
- ✅ Next.js 최적화

---

### 방법 2: Netlify

#### 1단계: Netlify 계정 생성
1. [Netlify](https://www.netlify.com) 접속
2. GitHub 계정으로 로그인

#### 2단계: 프로젝트 배포
1. "Add new site" → "Import an existing project"
2. GitHub 저장소 선택
3. 빌드 설정:
   - **Build command**: `cd subway && npm install && npm run build`
   - **Publish directory**: `subway/.next`
   - 또는 `netlify.toml` 파일 생성 (아래 참고)

#### 3단계: netlify.toml 파일 생성
프로젝트 루트에 `netlify.toml` 파일 생성:

```toml
[build]
  command = "cd subway && npm install && npm run build"
  publish = "subway/.next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 4단계: 환경 변수 설정
Netlify 대시보드 → Site settings → Environment variables에서 설정

---

### 방법 3: 자체 서버 (VPS/클라우드)

#### 1단계: 서버 준비
- Node.js 18 이상 설치
- PM2 또는 systemd로 프로세스 관리

#### 2단계: 프로젝트 업로드
```bash
# Git을 사용하는 경우
git clone <repository-url>
cd subway
npm install

# 또는 파일 업로드 후
npm install
```

#### 3단계: 빌드
```bash
npm run build
```

#### 4단계: 환경 변수 설정
`.env.production` 파일 생성:
```bash
NEXT_PUBLIC_SEOUL_API_KEY=your_api_key
```

#### 5단계: 프로덕션 서버 실행

**PM2 사용 (권장):**
```bash
# PM2 설치
npm install -g pm2

# 서버 시작
pm2 start npm --name "subway-app" -- start

# 자동 재시작 설정
pm2 startup
pm2 save
```

**또는 직접 실행:**
```bash
npm start
```

#### 6단계: Nginx 리버스 프록시 설정 (선택사항)

`/etc/nginx/sites-available/subway` 파일 생성:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 방법 4: Docker 배포

#### 1단계: Dockerfile 생성
프로젝트 루트에 `Dockerfile` 생성:

```dockerfile
FROM node:18-alpine AS base

# 의존성 설치 단계
FROM base AS deps
WORKDIR /app
COPY subway/package.json subway/package-lock.json ./
RUN npm ci

# 빌드 단계
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY subway ./
RUN npm run build

# 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 4000

ENV PORT 4000

CMD ["node", "server.js"]
```

#### 2단계: next.config.js 수정
standalone 출력 활성화:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // 추가
  async rewrites() {
    return [
      {
        source: '/api/seoul/:path*',
        destination: 'http://openapi.seoul.go.kr:8088/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

#### 3단계: Docker 이미지 빌드 및 실행
```bash
docker build -t subway-app .
docker run -p 4000:4000 --env-file .env.production subway-app
```

---

## 🔧 배포 전 빌드 테스트

로컬에서 프로덕션 빌드를 테스트하세요:

```bash
# 빌드
npm run build

# 프로덕션 모드로 실행
npm start
```

브라우저에서 `http://localhost:4000` 접속하여 정상 작동 확인

---

## ⚙️ 환경 변수 관리

### 개발 환경
- `.env.local` 파일 사용
- Git에 커밋하지 않음

### 프로덕션 환경
- 배포 플랫폼의 환경 변수 설정 사용
- Vercel: Dashboard → Settings → Environment Variables
- Netlify: Site settings → Environment variables
- 자체 서버: `.env.production` 파일 또는 시스템 환경 변수

### 필수 환경 변수
```bash
NEXT_PUBLIC_SEOUL_API_KEY=your_seoul_api_key
```

### 선택적 환경 변수
```bash
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

---

## 📝 배포 후 확인 사항

1. **홈페이지 접속 확인**
   - 메인 페이지가 정상적으로 로드되는지 확인

2. **API 엔드포인트 테스트**
   - `/api/train/congestion` 등 API가 정상 작동하는지 확인

3. **환경 변수 확인**
   - API 키가 제대로 설정되었는지 확인

4. **성능 확인**
   - 페이지 로딩 속도 확인
   - 이미지 최적화 확인

---

## 🐛 문제 해결

### 빌드 실패
```bash
# 캐시 삭제 후 재빌드
rm -rf .next node_modules
npm install
npm run build
```

### 환경 변수 인식 안 됨
- 환경 변수 이름이 `NEXT_PUBLIC_`로 시작하는지 확인
- 서버 재시작 필요

### 포트 충돌
- `package.json`의 포트 설정 변경
- 또는 환경 변수 `PORT` 설정

---

## 📊 추천 배포 플랫폼 비교

| 플랫폼 | 난이도 | 무료 플랜 | 자동 배포 | CDN | 추천도 |
|--------|--------|-----------|-----------|-----|--------|
| **Vercel** | ⭐ 쉬움 | ✅ 있음 | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Netlify** | ⭐⭐ 보통 | ✅ 있음 | ✅ | ✅ | ⭐⭐⭐⭐ |
| **자체 서버** | ⭐⭐⭐ 어려움 | ❌ | ❌ | ❌ | ⭐⭐⭐ |
| **Docker** | ⭐⭐⭐ 어려움 | ❌ | ❌ | ❌ | ⭐⭐⭐ |

---

## 🎯 빠른 시작 (Vercel)

가장 빠르게 배포하려면:

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com) 접속
3. "Import Project" 클릭
4. GitHub 저장소 선택
5. 환경 변수 설정
6. "Deploy" 클릭

완료! 🎉

---

## 📞 추가 도움말

배포 중 문제가 발생하면:
1. 빌드 로그 확인
2. 환경 변수 확인
3. Next.js 공식 문서 참고: https://nextjs.org/docs/deployment




