# 이상적인 프로젝트 구조 (트리 형태)

## 📁 전체 프로젝트 구조

```
subway/
│
├── 📱 app/                                    # Next.js App Router
│   ├── (main)/                               # 메인 레이아웃 그룹
│   │   ├── page.tsx                          # 🏠 홈 (대시보드)
│   │   │
│   │   ├── map/                              # 🗺️ 지하철 노선도
│   │   │   └── page.tsx
│   │   │
│   │   ├── stations/                         # 🚇 역 정보
│   │   │   ├── page.tsx                      # 역 목록
│   │   │   └── [id]/                         # 역 상세
│   │   │       └── page.tsx
│   │   │
│   │   ├── route/                            # 🛤️ 경로 찾기
│   │   │   └── page.tsx
│   │   │
│   │   ├── lines/                            # 📊 노선별 정보
│   │   │   └── page.tsx
│   │   │
│   │   ├── comparison/                       # ⏰ 시간대별 비교
│   │   │   └── page.tsx
│   │   │
│   │   ├── favorites/                        # ⭐ 즐겨찾기
│   │   │   └── page.tsx
│   │   │
│   │   ├── board/                            # 💬 게시판
│   │   │   ├── page.tsx                      # 게시판 목록
│   │   │   ├── [id]/                         # 게시글 상세
│   │   │   │   └── page.tsx
│   │   │   └── write/                         # 게시글 작성
│   │   │       └── page.tsx
│   │   │
│   │   ├── train-recommendation/             # 🤖 AI 추천
│   │   │   └── page.tsx
│   │   │
│   │   ├── analytics/                        # 📈 분석
│   │   │   └── page.tsx
│   │   │
│   │   ├── settings/                         # ⚙️ 설정
│   │   │   └── page.tsx
│   │   │
│   │   ├── login/                            # 🔐 로그인
│   │   │   └── page.tsx
│   │   │
│   │   ├── company/                          # 🏢 회사 소개
│   │   │   └── page.tsx
│   │   │
│   │   ├── content/                          # 📄 콘텐츠
│   │   │   └── page.tsx
│   │   │
│   │   ├── tips/                             # 💡 팁
│   │   │   └── page.tsx
│   │   │
│   │   └── report/                           # 🚨 신고
│   │       └── page.tsx
│   │
│   ├── api/                                  # 🔌 API Routes
│   │   ├── data/                             # 데이터 API
│   │   │   ├── route.ts                      # GET /api/data
│   │   │   └── historical_utf8/
│   │   │       └── route.ts                  # GET /api/data/historical_utf8
│   │   │
│   │   ├── predict/                          # 예측 API
│   │   │   └── route.ts                      # POST /api/predict
│   │   │
│   │   ├── route/                            # 경로 API
│   │   │   └── route.ts                      # POST /api/route
│   │   │
│   │   ├── train/                            # 열차 API
│   │   │   └── congestion/
│   │   │       └── route.ts                  # GET /api/train/congestion
│   │   │
│   │   └── cache/                            # 캐시 API
│   │       └── init/
│   │           └── route.ts                 # POST /api/cache/init
│   │
│   ├── layout.tsx                            # 📐 루트 레이아웃
│   └── globals.css                           # 🎨 전역 스타일
│
├── 🧩 components/                            # React 컴포넌트
│   │
│   ├── ui/                                   # 🎨 공용 UI 컴포넌트
│   │   ├── BottomNavigation.tsx              # 하단 네비게이션
│   │   ├── ErrorBoundary.tsx                 # 에러 바운더리
│   │   ├── ErrorMessage.tsx                  # 에러 메시지
│   │   ├── LoadingSpinner.tsx               # 로딩 스피너
│   │   ├── SkeletonLoader.tsx                # 스켈레톤 로더
│   │   └── Legend.tsx                        # 범례
│   │
│   ├── map/                                  # 🗺️ 지도 관련
│   │   └── SubwayMap.tsx                    # 통합 지하철 노선도 컴포넌트
│   │
│   ├── station/                              # 🚇 역 관련
│   │   ├── CongestionCard.tsx                # 혼잡도 카드
│   │   ├── CongestionVisualization.tsx        # 혼잡도 시각화
│   │   └── TrainCarCongestion.tsx           # 열차 칸별 혼잡도
│   │
│   ├── route/                                # 🛤️ 경로 관련
│   │   ├── RouteResultCard.tsx               # 경로 결과 카드
│   │   └── RouteScore.tsx                   # 경로 점수
│   │
│   ├── dashboard/                            # 📊 대시보드 관련
│   │   ├── PersonalizedDashboard.tsx         # 개인화 대시보드
│   │   ├── PersonalizedCard.tsx              # 개인화 카드
│   │   ├── CommuteInsightCard.tsx            # 출퇴근 인사이트 카드
│   │   └── UserEngagementCard.tsx            # 사용자 참여 카드
│   │
│   ├── board/                                # 💬 게시판 관련
│   │   └── CommunityFeed.tsx                 # 커뮤니티 피드
│   │
│   ├── premium/                              # 💎 프리미엄 기능
│   │   ├── PremiumTrainCongestion.tsx        # 프리미엄 열차 혼잡도
│   │   └── PremiumServiceCard.tsx            # 프리미엄 서비스 카드
│   │
│   ├── common/                               # 🔧 공통 컴포넌트
│   │   ├── BrandTrustFooter.tsx              # 브랜드 신뢰 푸터
│   │   ├── PartnershipAds.tsx                # 파트너십 광고
│   │   ├── TrendNewsCard.tsx                 # 트렌드 뉴스 카드
│   │   ├── VoiceButton.tsx                   # 음성 버튼
│   │   └── ThemeProvider.tsx                 # 테마 프로바이더
│   │
│   └── train/                                # 🚂 열차 관련
│       └── TrainCarVisualization.tsx         # 열차 칸 시각화
│
├── 📚 lib/                                   # 라이브러리 및 유틸리티
│   │
│   ├── services/                             # 🌐 외부 서비스 연동
│   │   ├── api.ts                            # 서울시 공공데이터 API
│   │   ├── naverMapApi.ts                    # 네이버 지도 API
│   │   ├── authService.ts                    # 인증 서비스
│   │   ├── boardService.ts                   # 게시판 서비스
│   │   ├── notificationService.ts            # 알림 서비스
│   │   ├── voiceService.ts                   # 음성 서비스
│   │   └── weatherService.ts                 # 날씨 서비스
│   │
│   ├── data/                                 # 📊 데이터 관련
│   │   ├── subwayMapData.ts                  # 지하철 노선 데이터
│   │   ├── stationData.ts                    # 역 데이터
│   │   ├── stationCoordinates.ts             # 역 좌표 데이터
│   │   └── stationNameMapper.ts              # 역명 매핑
│   │
│   ├── utils/                                # 🛠️ 유틸리티 함수
│   │   ├── csvParser.ts                      # CSV 파서
│   │   ├── routeUtils.ts                     # 경로 유틸리티
│   │   ├── storage.ts                        # 스토리지 유틸리티
│   │   ├── logger.ts                         # 로거
│   │   └── common.ts                         # 공통 유틸리티 (getLineColor 등)
│   │
│   ├── algorithms/                           # 🧮 알고리즘
│   │   ├── routeAlgorithm.ts                 # 경로 알고리즘
│   │   ├── routeNormalizer.ts                # 경로 정규화
│   │   └── recommendation.ts                 # 추천 알고리즘
│   │
│   ├── graph/                                # 📈 그래프 관련
│   │   ├── buildSubwayGraph.ts               # 지하철 그래프 구축
│   │   ├── crowdingWeight.ts                # 혼잡도 가중치
│   │   ├── shortestPaths.ts                 # 최단 경로
│   │   └── types.ts                          # 그래프 타입
│   │
│   ├── ai/                                   # 🤖 AI 관련
│   │   ├── aiService.ts                      # AI 서비스
│   │   ├── analysis.ts                       # 분석
│   │   └── contentGenerator.ts               # 콘텐츠 생성
│   │
│   ├── cache/                                # 💾 캐시 관련
│   │   └── cache.ts                          # 캐시 유틸리티
│   │
│   └── constants/                            # 📌 상수
│       └── index.ts                          # 상수 정의
│
├── 🪝 hooks/                                 # Custom Hooks
│   ├── useFavorites.ts                       # 즐겨찾기 훅
│   └── useRouteSearch.ts                     # 경로 검색 훅
│
├── 🔄 contexts/                              # React Context
│   └── PredictionTimeContext.tsx             # 예측 시간 컨텍스트
│
├── 📝 types/                                 # TypeScript 타입 정의
│   └── route.ts                              # 경로 타입
│
├── 🧪 __tests__/                             # 테스트 파일
│   ├── api.data.test.ts                      # 데이터 API 테스트
│   ├── api.predict.test.ts                  # 예측 API 테스트
│   ├── api.train.test.ts                    # 열차 API 테스트
│   ├── cache.test.ts                         # 캐시 테스트
│   ├── csvParser.test.ts                     # CSV 파서 테스트
│   └── prediction.test.ts                   # 예측 테스트
│
├── 📜 scripts/                               # 스크립트
│   ├── debug-csv.ts                          # CSV 디버그 스크립트
│   ├── evaluateCongestion.ts                 # 혼잡도 평가 스크립트
│   └── test-station-mapping.ts               # 역 매핑 테스트 스크립트
│
├── 🧑‍💻 __dev__/                              # 개발/테스트 전용 (선택사항)
│   ├── test-mapping/                         # 역명 매칭 테스트 페이지
│   │   └── page.tsx
│   ├── train-congestion-demo/                 # 열차 혼잡도 데모 페이지
│   │   └── page.tsx
│   └── api/                                  # 개발용 API
│       └── test/
│           └── mapping/
│               └── route.ts                  # 역명 매칭 테스트 API
│
├── 📁 public/                                # 정적 파일
│   └── eval/                                 # 평가 데이터
│       ├── mae_by_hour.csv
│       ├── mae_by_hour.json
│       ├── mae_by_line.csv
│       ├── mae_by_line.json
│       └── overall_metrics.json
│
├── 📖 docs/                                 # 문서
│   └── CONGESTION_CRITERIA.md                # 혼잡도 기준 문서
│
├── 📦 _archive/                              # 보관용 (삭제 전 백업)
│   ├── app/
│   │   ├── map-new/
│   │   └── map-redesigned/
│   └── components/
│       ├── EnhancedSubwayMap.tsx
│       ├── RedesignedSubwayMap.tsx
│       ├── CleanSubwayMap.tsx
│       ├── SchematicSubwayMap.tsx
│       └── InteractiveMap.tsx
│
├── 📄 package.json                           # 패키지 설정
├── 📄 tsconfig.json                          # TypeScript 설정
├── 📄 next.config.js                         # Next.js 설정
├── 📄 tailwind.config.js                    # Tailwind 설정
├── 📄 jest.config.js                         # Jest 설정
├── 📄 playwright.config.ts                   # Playwright 설정
└── 📄 README.md                              # 프로젝트 설명서
```

---

## 📋 폴더별 설명

### 🎯 app/ (Next.js App Router)
- **역할**: 페이지 라우팅 및 API 엔드포인트
- **구조**: 도메인 중심 구조로 정리
- **특징**: 
  - `(main)` 그룹으로 메인 레이아웃 공유
  - 각 도메인별로 폴더 분리
  - API는 `/api` 하위에 기능별로 분리

### 🧩 components/ (React 컴포넌트)
- **역할**: 재사용 가능한 UI 컴포넌트
- **구조**: 도메인별로 폴더 분리
- **특징**:
  - `ui/`: 공용 UI 컴포넌트 (버튼, 로더 등)
  - `map/`, `station/`, `route/` 등: 도메인별 컴포넌트
  - 각 폴더는 관련 컴포넌트만 포함

### 📚 lib/ (라이브러리 및 유틸리티)
- **역할**: 비즈니스 로직, 유틸리티, 서비스 연동
- **구조**: 역할별로 폴더 분리
- **특징**:
  - `services/`: 외부 API 연동
  - `data/`: 정적 데이터 파일
  - `utils/`: 유틸리티 함수
  - `algorithms/`: 알고리즘 로직
  - `graph/`: 그래프 관련 로직
  - `ai/`: AI 관련 로직
  - `cache/`: 캐시 관련 로직

### 🪝 hooks/ (Custom Hooks)
- **역할**: 재사용 가능한 React 훅
- **구조**: 기능별로 파일 분리
- **특징**: 각 훅은 단일 책임 원칙 준수

### 🔄 contexts/ (React Context)
- **역할**: 전역 상태 관리
- **구조**: 컨텍스트별로 파일 분리

### 📝 types/ (TypeScript 타입)
- **역할**: 타입 정의
- **구조**: 도메인별로 파일 분리

### 🧪 __tests__/ (테스트)
- **역할**: 단위 테스트
- **구조**: 소스 파일과 동일한 구조

### 📜 scripts/ (스크립트)
- **역할**: 개발/빌드 스크립트
- **구조**: 기능별로 파일 분리

### 🧑‍💻 __dev__/ (개발 전용)
- **역할**: 개발/테스트 전용 페이지 및 API
- **구조**: 프로덕션과 분리
- **특징**: 프로덕션 빌드에서 제외 가능

---

## 🔑 주요 원칙

1. **도메인 중심 구조**: 관련 기능을 한 곳에 모음
2. **단일 책임 원칙**: 각 파일/폴더는 하나의 역할만 담당
3. **명확한 네이밍**: 폴더/파일 이름만으로 용도 파악 가능
4. **계층적 구조**: 깊이 2-3단계로 유지
5. **일관성**: 동일한 패턴을 프로젝트 전반에 적용

---

## 📊 변경 전후 비교

### 변경 전 (문제점)
```
components/
├── BottomNavigation.tsx
├── EnhancedSubwayMap.tsx
├── InteractiveSubwayMap.tsx
├── RedesignedSubwayMap.tsx
├── CleanSubwayMap.tsx
├── SchematicSubwayMap.tsx
├── InteractiveMap.tsx
├── ... (30개 이상의 평면 파일)

lib/
├── api.ts
├── authService.ts
├── csvParser.ts
├── csvParserOptimized.ts
├── subwayMapData.ts
├── subwayMapDataComplete.ts
├── ... (모든 것이 한 폴더에)
```

### 변경 후 (개선점)
```
components/
├── ui/                    # 공용 UI
├── map/                   # 지도 관련 (단일 컴포넌트)
├── station/               # 역 관련
├── route/                 # 경로 관련
└── ... (도메인별 분리)

lib/
├── services/              # 외부 서비스
├── data/                  # 데이터
├── utils/                 # 유틸리티
├── algorithms/            # 알고리즘
└── ... (역할별 분리)
```

---

이 구조를 따르면 프로젝트의 유지보수성, 확장성, 가독성이 크게 향상됩니다.









