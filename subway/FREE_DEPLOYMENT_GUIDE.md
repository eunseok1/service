# 무료 배포 가이드 (단계별)

이 가이드는 Next.js 프로젝트를 **완전 무료**로 배포하는 방법을 안내합니다.

---

## 🚀 방법 1: Vercel (가장 추천 ⭐⭐⭐⭐⭐)

**왜 Vercel인가?**
- Next.js를 만든 회사에서 제공
- 완전 무료 (개인 프로젝트)
- 자동 HTTPS, CDN 포함
- GitHub 연동으로 자동 배포
- 설정이 매우 간단

### 단계별 가이드

#### 1단계: GitHub에 코드 업로드

1. **GitHub 계정 생성** (없다면)
   - https://github.com 접속
   - "Sign up" 클릭하여 계정 생성

2. **새 저장소 생성**
   - GitHub 로그인 후 우측 상단 "+" → "New repository" 클릭
   - Repository name: `seoul-subway-app` (원하는 이름)
   - Public 선택 (무료)
   - "Create repository" 클릭

3. **코드 업로드**
   ```bash
   # 프로젝트 폴더에서 실행
   cd subway
   
   # Git 초기화 (아직 안 했다면)
   git init
   
   # 모든 파일 추가
   git add .
   
   # 첫 커밋
   git commit -m "Initial commit"
   
   # GitHub 저장소 연결 (YOUR_USERNAME을 본인 계정으로 변경)
   git remote add origin https://github.com/YOUR_USERNAME/seoul-subway-app.git
   
   # 코드 업로드
   git branch -M main
   git push -u origin main
   ```

#### 2단계: Vercel에 배포

1. **Vercel 가입**
   - https://vercel.com 접속
   - "Sign Up" 클릭
   - "Continue with GitHub" 선택 (GitHub 계정으로 로그인)

2. **프로젝트 가져오기**
   - Vercel 대시보드에서 "Add New Project" 클릭
   - "Import Git Repository"에서 방금 만든 GitHub 저장소 선택
   - "Import" 클릭

3. **프로젝트 설정**
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `subway` (또는 프로젝트 루트가 subway 폴더라면 `.`로 변경)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install` (기본값)

4. **환경 변수 설정** (중요!)
   - "Environment Variables" 섹션 클릭
   - 다음 변수 추가:
     ```
     Name: NEXT_PUBLIC_SEOUL_API_KEY
     Value: (본인의 서울시 API 키)
     ```
   - "Add" 클릭

5. **배포 시작**
   - "Deploy" 버튼 클릭
   - 1-2분 정도 기다리면 배포 완료!

6. **배포 완료**
   - 배포가 완료되면 자동으로 URL이 생성됩니다
   - 예: `https://seoul-subway-app.vercel.app`
   - 이 URL로 접속하면 사이트가 작동합니다!

### ✅ Vercel 배포 완료 체크리스트

- [ ] GitHub에 코드 업로드 완료
- [ ] Vercel 계정 생성 완료
- [ ] 프로젝트 import 완료
- [ ] 환경 변수 설정 완료
- [ ] 배포 성공 확인
- [ ] 사이트 접속 테스트 완료

---

## 🌐 방법 2: Netlify (대안)

**장점:**
- 무료 플랜 제공
- 자동 배포
- 간단한 설정

### 단계별 가이드

#### 1단계: GitHub에 코드 업로드
- Vercel과 동일 (위 참고)

#### 2단계: Netlify에 배포

1. **Netlify 가입**
   - https://www.netlify.com 접속
   - "Sign up" → "GitHub" 선택

2. **프로젝트 추가**
   - "Add new site" → "Import an existing project"
   - GitHub 저장소 선택

3. **빌드 설정**
   - **Base directory**: `subway` (또는 프로젝트 루트)
   - **Build command**: `cd subway && npm install && npm run build`
   - **Publish directory**: `subway/.next`

4. **환경 변수 설정**
   - "Site settings" → "Environment variables"
   - `NEXT_PUBLIC_SEOUL_API_KEY` 추가

5. **배포**
   - "Deploy site" 클릭

---

## 📦 방법 3: Railway (서버 필요 시)

**장점:**
- Node.js 서버 실행 가능
- 데이터베이스 연동 가능
- 무료 크레딧 제공

### 단계별 가이드

1. **Railway 가입**
   - https://railway.app 접속
   - GitHub 계정으로 로그인

2. **프로젝트 생성**
   - "New Project" → "Deploy from GitHub repo"
   - 저장소 선택

3. **설정**
   - 자동으로 Next.js 감지
   - 환경 변수 추가

4. **배포**
   - 자동 배포 시작

---

## 🔧 배포 전 필수 확인 사항

### 1. 빌드 테스트 (로컬)

```bash
cd subway
npm run build
```

**중요:** 빌드가 성공해야만 배포가 가능합니다!

### 2. 환경 변수 확인

`.env.local` 파일에 있는 환경 변수를 배포 플랫폼에도 설정해야 합니다:

- `NEXT_PUBLIC_SEOUL_API_KEY`: 서울시 공공데이터 API 키

### 3. Git 설정 확인

`.gitignore` 파일에 다음이 포함되어 있는지 확인:
```
.env*.local
.env
node_modules/
.next/
```

**중요:** `.env.local` 파일은 절대 GitHub에 업로드하지 마세요!

---

## 🐛 배포 실패 시 해결 방법

### 문제 1: 빌드 실패

**증상:** 배포 중 "Build failed" 오류

**해결:**
```bash
# 로컬에서 빌드 테스트
cd subway
npm run build

# 오류가 있으면 수정 후 다시 커밋
git add .
git commit -m "Fix build errors"
git push
```

### 문제 2: 환경 변수 인식 안 됨

**증상:** 사이트는 열리지만 API 호출 실패

**해결:**
- 배포 플랫폼의 환경 변수 설정 확인
- 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수)
- 배포 플랫폼에서 "Redeploy" 실행

### 문제 3: 포트 오류

**증상:** "Port already in use" 오류

**해결:**
- Vercel/Netlify는 자동으로 포트를 관리하므로 문제 없음
- Railway 등 서버 플랫폼 사용 시 `PORT` 환경 변수 설정

---

## 📊 무료 플랫폼 비교

| 플랫폼 | 무료 플랜 | 자동 배포 | HTTPS | CDN | 추천도 |
|--------|-----------|-----------|-------|-----|--------|
| **Vercel** | ✅ 무제한 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Netlify** | ✅ 100GB/월 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Railway** | ✅ $5 크레딧/월 | ✅ | ✅ | ❌ | ⭐⭐⭐ |
| **Render** | ✅ 제한적 | ✅ | ✅ | ❌ | ⭐⭐⭐ |

---

## 🎯 가장 빠른 배포 방법 (5분 안에!)

1. **GitHub에 코드 업로드** (2분)
   ```bash
   cd subway
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```

2. **Vercel 배포** (3분)
   - https://vercel.com 접속
   - GitHub로 로그인
   - 저장소 선택
   - 환경 변수 설정
   - Deploy 클릭

**완료!** 🎉

---

## 💡 추가 팁

### 커스텀 도메인 연결 (선택사항)

Vercel/Netlify에서 무료로 커스텀 도메인을 연결할 수 있습니다:

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 설정

### 자동 배포 설정

GitHub에 코드를 푸시하면 자동으로 배포됩니다:
```bash
git add .
git commit -m "Update features"
git push  # 자동으로 배포 시작!
```

### 배포 상태 확인

- Vercel: 대시보드에서 실시간 배포 로그 확인 가능
- Netlify: Deploy log에서 빌드 과정 확인 가능

---

## 📞 도움이 필요하신가요?

배포 중 문제가 발생하면:
1. 빌드 로그 확인
2. 환경 변수 확인
3. GitHub 코드가 최신인지 확인

**빌드가 성공하면 배포도 성공합니다!** 🚀

