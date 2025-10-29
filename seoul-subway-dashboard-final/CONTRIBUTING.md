# 기여 가이드

이 프로젝트에 기여해주셔서 감사합니다! 다음 가이드라인을 따라주세요.

## 🚀 시작하기

1. **Repository Fork**
   ```bash
   # GitHub에서 Fork 버튼 클릭
   ```

2. **로컬에 클론**
   ```bash
   git clone https://github.com/your-username/seoul-subway-dashboard.git
   cd seoul-subway-dashboard
   ```

3. **브랜치 생성**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 기여 방법

### 버그 리포트
- **GitHub Issues** 사용
- 명확한 제목과 설명
- 재현 단계 포함
- 예상 결과와 실제 결과 명시

### 기능 제안
- **GitHub Issues** 사용
- "Feature Request" 라벨 사용
- 사용 사례와 이점 설명

### 코드 기여
1. **코드 스타일 준수**
   - JavaScript: ES6+ 문법 사용
   - CSS: BEM 방법론 권장
   - HTML: 시맨틱 태그 사용

2. **커밋 메시지 규칙**
   ```
   type(scope): description
   
   예시:
   feat(route): add multi-line route generation
   fix(ui): resolve modal closing issue
   docs(readme): update installation guide
   ```

3. **테스트**
   - 브라우저에서 수동 테스트
   - 다양한 디바이스에서 확인
   - 기능별 테스트 케이스 작성

## 🔧 개발 환경 설정

### 필요 사항
- Python 3.6+
- 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 텍스트 에디터 (VS Code 권장)

### 실행 방법
```bash
# HTTP 서버 시작
python -m http.server 3000

# 브라우저에서 접속
http://localhost:3000
```

## 📋 기여 체크리스트

### Pull Request 전 확인사항
- [ ] 코드가 프로젝트 스타일을 따름
- [ ] 새로운 기능에 대한 테스트 완료
- [ ] 문서 업데이트 (필요시)
- [ ] 커밋 메시지가 명확함
- [ ] 충돌 해결 완료

### 코드 리뷰 기준
- [ ] 기능이 올바르게 작동함
- [ ] 코드가 읽기 쉽고 이해하기 쉬움
- [ ] 성능에 부정적 영향 없음
- [ ] 보안 이슈 없음

## 🎯 우선순위 기능

### 높은 우선순위
- [ ] 실제 API 연동
- [ ] 모바일 최적화
- [ ] 접근성 개선
- [ ] 성능 최적화

### 중간 우선순위
- [ ] 다국어 지원
- [ ] 테마 변경 기능
- [ ] 알림 기능
- [ ] 오프라인 지원

### 낮은 우선순위
- [ ] PWA 지원
- [ ] 소셜 로그인
- [ ] 고급 분석 기능

## 📞 문의

기여 과정에서 질문이 있으시면:
- **GitHub Issues** 사용
- **Discussions** 탭 활용
- **이메일**: your-email@example.com

## 🙏 감사

모든 기여자분들께 감사드립니다!

---

**함께 만들어가는 서울 지하철 대시보드! 🚇**
