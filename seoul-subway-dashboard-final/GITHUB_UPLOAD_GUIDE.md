# 🚀 GitHub 업로드 가이드

이 가이드는 서울 지하철 대시보드를 GitHub에 업로드하는 방법을 설명합니다.

## 📁 프로젝트 구조

```
seoul-subway-dashboard-final/
├── index.html              # 메인 대시보드 파일
├── README.md               # 프로젝트 설명서
├── package.json            # 프로젝트 설정
├── LICENSE                 # MIT 라이선스
├── CONTRIBUTING.md         # 기여 가이드
└── .gitignore             # Git 무시 파일
```

## 🔧 GitHub 업로드 단계

### 1단계: GitHub Repository 생성

1. **GitHub 로그인**
   - https://github.com 접속
   - 로그인 또는 회원가입

2. **새 Repository 생성**
   - 우상단 "+" 버튼 클릭
   - "New repository" 선택
   - Repository 이름: `seoul-subway-dashboard`
   - Description: `AI-powered real-time Seoul Subway congestion dashboard`
   - Public 선택
   - "Create repository" 클릭

### 2단계: 로컬 Git 초기화

```bash
# 1. 프로젝트 폴더로 이동
cd seoul-subway-dashboard-final

# 2. Git 초기화
git init

# 3. 파일 추가
git add .

# 4. 첫 커밋
git commit -m "Initial commit: Seoul Subway Dashboard v1.0.0"

# 5. 원격 저장소 연결
git remote add origin https://github.com/your-username/seoul-subway-dashboard.git

# 6. 메인 브랜치 설정
git branch -M main

# 7. 업로드
git push -u origin main
```

### 3단계: GitHub Pages 설정 (선택사항)

1. **Repository 설정**
   - Repository 페이지에서 "Settings" 클릭
   - 왼쪽 메뉴에서 "Pages" 선택

2. **GitHub Pages 활성화**
   - Source: "Deploy from a branch" 선택
   - Branch: "main" 선택
   - Folder: "/ (root)" 선택
   - "Save" 클릭

3. **배포 확인**
   - 몇 분 후 https://your-username.github.io/seoul-subway-dashboard 접속
   - 대시보드가 정상 작동하는지 확인

## 📝 README 커스터마이징

### 1. API 키 설정 안내
```markdown
## 🔧 설정

### API 키 발급 방법
1. **서울시 공공데이터**: https://data.seoul.go.kr
2. **OpenWeatherMap**: https://openweathermap.org/api

### API 키 설정
`index.html` 파일에서 다음 부분을 수정하세요:

```javascript
// 지하철 API 키
const SUBWAY_API_KEY = 'your-subway-api-key';

// 날씨 API 키
const WEATHER_API_KEY = 'your-weather-api-key';
```
```

### 2. 사용자 정보 업데이트
- `package.json`에서 author 정보 수정
- `README.md`에서 연락처 정보 수정
- `CONTRIBUTING.md`에서 이메일 주소 수정

## 🎯 추가 설정

### 1. Repository 설정
- **Topics 추가**: `seoul`, `subway`, `dashboard`, `ai`, `congestion`, `korea`
- **Description**: 프로젝트 간단 설명
- **Website**: GitHub Pages URL

### 2. Issues 템플릿 (선택사항)
```markdown
# Bug Report

## Description
버그에 대한 명확하고 간결한 설명

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
예상했던 동작

## Actual Behavior
실제로 발생한 동작

## Screenshots
가능하면 스크린샷 첨부

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 90]
- Version: [e.g. 1.0.0]
```

## 🚀 배포 후 작업

### 1. 기능 테스트
- [ ] 모든 기능이 정상 작동하는지 확인
- [ ] 모바일에서도 잘 작동하는지 확인
- [ ] 다양한 브라우저에서 테스트

### 2. 문서 업데이트
- [ ] README.md에 실제 배포 URL 추가
- [ ] 사용법 가이드 완성
- [ ] 스크린샷 추가

### 3. 커뮤니티 참여
- [ ] 관련 커뮤니티에 프로젝트 공유
- [ ] 피드백 수집
- [ ] 기여자 모집

## 📞 문제 해결

### 일반적인 문제들

1. **Push 권한 오류**
   ```bash
   # SSH 키 설정 또는 Personal Access Token 사용
   git remote set-url origin https://your-username:your-token@github.com/your-username/seoul-subway-dashboard.git
   ```

2. **GitHub Pages가 작동하지 않음**
   - Repository가 Public인지 확인
   - index.html 파일이 루트에 있는지 확인
   - 몇 분 더 기다린 후 다시 시도

3. **API 키 오류**
   - 실제 API 키를 발급받아 설정
   - CORS 정책 확인

## 🎉 완료!

축하합니다! 서울 지하철 대시보드가 성공적으로 GitHub에 업로드되었습니다.

**다음 단계:**
- 프로젝트 홍보
- 사용자 피드백 수집
- 지속적인 기능 개선

---

**🚇 서울 지하철과 함께하는 스마트한 출퇴근!**
