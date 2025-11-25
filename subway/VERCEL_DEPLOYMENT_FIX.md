# Vercel 배포 오류 해결 가이드

## 🔍 현재 상황
Vercel에서 404 NOT_FOUND 오류가 발생하고 있습니다.

## ✅ 해결 단계

### 1단계: Vercel 대시보드에서 Root Directory 설정 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Settings → General 이동**
   - 왼쪽 메뉴에서 "Settings" 클릭
   - "General" 탭 선택

3. **Root Directory 설정**
   - "Root Directory" 섹션 찾기
   - **반드시 `subway` 입력** (빈 값이면 안 됨!)
   - "Save" 클릭

4. **환경 변수 확인** (Settings → Environment Variables)
   - `NEXT_PUBLIC_SEOUL_API_KEY` 확인
   - 없으면 추가

### 2단계: 재배포

1. **Deployments 탭으로 이동**
2. **최신 배포의 "..." 메뉴 클릭**
3. **"Redeploy" 선택**
4. **빌드 로그 확인**

### 3단계: 빌드 로그 확인

배포가 실패하면:
1. 실패한 배포 클릭
2. "Build Logs" 탭 확인
3. 오류 메시지 확인

**주요 확인 사항:**
- ✅ 빌드가 성공했는지
- ✅ Root Directory가 올바르게 인식되었는지
- ✅ 환경 변수가 로드되었는지

### 4단계: 로컬 빌드 테스트

로컬에서 빌드가 성공하는지 확인:

```bash
cd subway
npm install
npm run build
```

빌드가 실패하면 오류를 수정해야 합니다.

## 🐛 일반적인 문제들

### 문제 1: Root Directory가 설정되지 않음
**증상:** 빌드는 성공하지만 404 오류 발생
**해결:** Vercel 대시보드에서 Root Directory를 `subway`로 설정

### 문제 2: 빌드 실패
**증상:** 배포가 실패함
**해결:** 빌드 로그 확인 후 오류 수정

### 문제 3: 환경 변수 누락
**증상:** 빌드는 성공하지만 API 호출 실패
**해결:** 환경 변수 추가 후 재배포

## 📝 체크리스트

- [ ] Vercel 대시보드에서 Root Directory = `subway` 설정
- [ ] 환경 변수 `NEXT_PUBLIC_SEOUL_API_KEY` 설정
- [ ] 로컬에서 `npm run build` 성공
- [ ] 변경사항 커밋 및 푸시 완료
- [ ] Vercel에서 재배포 완료
- [ ] 빌드 로그에서 오류 없음 확인

## 💡 추가 도움

문제가 계속되면:
1. Vercel 빌드 로그의 전체 오류 메시지 공유
2. 로컬 빌드 결과 공유
3. Vercel 대시보드의 Root Directory 설정 스크린샷


