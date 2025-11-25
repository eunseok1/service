# 프로젝트 구조 분석 및 정리 방안

## 📋 1. 프로젝트 구조 분석 결과

### 1.1 중복된 파일/폴더

#### 🗺️ 지도 관련 페이지 (4개 중복)
- `app/map/page.tsx` - EnhancedSubwayMap 사용 (기본 버전)
- `app/map-new/page.tsx` - InteractiveSubwayMap 사용 (새 버전)
- `app/map-redesigned/page.tsx` - RedesignedSubwayMap 사용 (리디자인 버전)
- `app/test-mapping/page.tsx` - 테스트용 페이지

**문제점:**
- 동일한 기능의 3가지 버전이 공존
- 사용자가 어떤 버전을 사용해야 할지 혼란
- 유지보수 시 3곳을 모두 수정해야 함

**권장사항:**
- `map-new` (InteractiveSubwayMap) 또는 `map-redesigned` (RedesignedSubwayMap) 중 하나를 메인으로 선택
- 나머지는 삭제하거나 `_archive` 폴더로 이동
- `test-mapping`은 개발용이므로 제거 또는 `__dev__` 폴더로 이동

#### 🧩 지도 컴포넌트 (6개 중복)
- `components/EnhancedSubwayMap.tsx` - map 페이지에서 사용
- `components/InteractiveSubwayMap.tsx` - map-new 페이지에서 사용
- `components/RedesignedSubwayMap.tsx` - map-redesigned 페이지에서 사용
- `components/CleanSubwayMap.tsx` - 사용처 불명확
- `components/SchematicSubwayMap.tsx` - 사용처 불명확
- `components/InteractiveMap.tsx` - 사용처 불명확

**문제점:**
- 6개의 유사한 컴포넌트가 존재
- 어떤 것이 최신/정식 버전인지 불명확
- 코드 중복 및 유지보수 어려움

**권장사항:**
- 최신/가장 완성도 높은 버전 하나만 유지
- 나머지는 `components/_archive` 또는 삭제
- 필요시 기능을 통합하여 단일 컴포넌트로 정리

#### 📄 CSV 파서 (2개 중복)
- `lib/csvParser.ts` - 기본 CSV 파서 (4곳에서 사용)
- `lib/csvParserOptimized.ts` - 최적화된 CSV 파서 (사용처 없음)

**문제점:**
- 두 파일이 유사한 기능 제공
- `csvParserOptimized`는 사용되지 않음

**권장사항:**
- `csvParserOptimized`가 더 나은 성능을 제공한다면 `csvParser.ts`로 교체
- 그렇지 않다면 `csvParserOptimized.ts` 삭제

#### 🗺️ 지하철 데이터 (2개 중복)
- `lib/subwayMapData.ts` - 기본 지하철 데이터 (6곳에서 사용)
- `lib/subwayMapDataComplete.ts` - 완전한 지하철 데이터 (사용처 없음)

**문제점:**
- 두 파일이 유사한 데이터 구조
- `subwayMapDataComplete`는 사용되지 않음

**권장사항:**
- `subwayMapDataComplete`가 더 완전한 데이터라면 `subwayMapData.ts`로 교체
- 그렇지 않다면 `subwayMapDataComplete.ts` 삭제

### 1.2 Demo/Test 용도 디렉토리

#### 🧪 테스트 페이지
- `app/test-mapping/page.tsx` - 역명 매칭 테스트 페이지
- `app/train-congestion-demo/page.tsx` - 열차 혼잡도 데모 페이지

**문제점:**
- 프로덕션에 테스트/데모 페이지가 포함됨
- 사용자에게 노출되면 혼란 야기

**권장사항:**
- 개발/테스트 전용 폴더로 이동 (`__dev__/` 또는 `_demo/`)
- 또는 완전히 제거

#### 🔧 테스트 API
- `app/api/test/mapping/route.ts` - 역명 매칭 테스트 API

**문제점:**
- 프로덕션 API에 테스트 엔드포인트 포함

**권장사항:**
- 개발 환경에서만 사용하도록 제한
- 또는 `__dev__/api/test/`로 이동

### 1.3 일관성 없는 네이밍

#### 📁 폴더 구조
- `components/route/utils.ts` - route 관련 유틸이 components에 위치
- `lib/` 폴더에 서비스, 유틸, 데이터가 뒤섞여 있음

**문제점:**
- route 관련 유틸이 components에 있음 (lib로 이동 필요)
- lib 폴더가 너무 많은 역할을 담당

**권장사항:**
- `components/route/utils.ts` → `lib/route/utils.ts`로 이동
- lib 폴더를 역할별로 세분화

### 1.4 잘못된 위치의 파일

#### 📂 components/route/utils.ts
- 현재: `components/route/utils.ts`
- 문제: 유틸리티 함수가 컴포넌트 폴더에 위치
- 권장: `lib/utils/route.ts` 또는 `lib/route/utils.ts`로 이동

### 1.5 불필요한 파일

#### 📄 루트 파일
- `route-standalone.html` - 독립 실행 HTML 파일 (사용처 불명확)

**권장사항:**
- 사용되지 않는다면 삭제
- 필요하다면 `docs/` 또는 `examples/` 폴더로 이동

---

## 🏗️ 2. Next.js App Router 기준 이상적인 프로젝트 구조

### 2.1 제안하는 폴더 구조

```
subway/
├── app/                          # Next.js App Router
│   ├── (main)/                   # 메인 레이아웃 그룹
│   │   ├── page.tsx             # 홈 (대시보드)
│   │   ├── map/                 # 지하철 노선도 (통합된 단일 버전)
│   │   │   └── page.tsx
│   │   ├── stations/            # 역 정보
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── route/               # 경로 찾기
│   │   │   └── page.tsx
│   │   ├── lines/               # 노선별 정보
│   │   │   └── page.tsx
│   │   ├── comparison/          # 시간대별 비교
│   │   │   └── page.tsx
│   │   ├── favorites/           # 즐겨찾기
│   │   │   └── page.tsx
│   │   ├── board/               # 게시판
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── write/
│   │   │       └── page.tsx
│   │   ├── train-recommendation/ # AI 추천
│   │   │   └── page.tsx
│   │   ├── analytics/           # 분석
│   │   │   └── page.tsx
│   │   ├── settings/            # 설정
│   │   │   └── page.tsx
│   │   ├── login/               # 로그인
│   │   │   └── page.tsx
│   │   ├── company/             # 회사 소개
│   │   │   └── page.tsx
│   │   ├── content/             # 콘텐츠
│   │   │   └── page.tsx
│   │   ├── tips/                # 팁
│   │   │   └── page.tsx
│   │   └── report/               # 신고
│   │       └── page.tsx
│   │
│   ├── api/                      # API Routes
│   │   ├── data/                # 데이터 API
│   │   │   ├── route.ts
│   │   │   └── historical_utf8/
│   │   │       └── route.ts
│   │   ├── predict/             # 예측 API
│   │   │   └── route.ts
│   │   ├── route/               # 경로 API
│   │   │   └── route.ts
│   │   ├── train/               # 열차 API
│   │   │   └── congestion/
│   │   │       └── route.ts
│   │   └── cache/               # 캐시 API
│   │       └── init/
│   │           └── route.ts
│   │
│   ├── layout.tsx               # 루트 레이아웃
│   └── globals.css              # 전역 스타일
│
├── components/                   # React 컴포넌트
│   ├── ui/                      # 공용 UI 컴포넌트
│   │   ├── BottomNavigation.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── SkeletonLoader.tsx
│   │   └── Legend.tsx
│   │
│   ├── map/                     # 지도 관련 컴포넌트
│   │   └── SubwayMap.tsx       # 통합된 단일 지도 컴포넌트
│   │
│   ├── station/                 # 역 관련 컴포넌트
│   │   ├── CongestionCard.tsx
│   │   ├── CongestionVisualization.tsx
│   │   └── TrainCarCongestion.tsx
│   │
│   ├── route/                   # 경로 관련 컴포넌트
│   │   ├── RouteResultCard.tsx
│   │   └── RouteScore.tsx
│   │
│   ├── dashboard/               # 대시보드 컴포넌트
│   │   ├── PersonalizedDashboard.tsx
│   │   ├── PersonalizedCard.tsx
│   │   ├── CommuteInsightCard.tsx
│   │   └── UserEngagementCard.tsx
│   │
│   ├── board/                   # 게시판 컴포넌트
│   │   └── CommunityFeed.tsx
│   │
│   ├── premium/                 # 프리미엄 기능 컴포넌트
│   │   ├── PremiumTrainCongestion.tsx
│   │   └── PremiumServiceCard.tsx
│   │
│   ├── common/                  # 공통 컴포넌트
│   │   ├── BrandTrustFooter.tsx
│   │   ├── PartnershipAds.tsx
│   │   ├── TrendNewsCard.tsx
│   │   ├── VoiceButton.tsx
│   │   └── ThemeProvider.tsx
│   │
│   └── train/                   # 열차 관련 컴포넌트
│       └── TrainCarVisualization.tsx
│
├── lib/                         # 라이브러리 및 유틸리티
│   ├── services/                # 외부 서비스 연동
│   │   ├── api.ts              # 서울시 API
│   │   ├── naverMapApi.ts      # 네이버 지도 API
│   │   ├── authService.ts      # 인증 서비스
│   │   ├── boardService.ts     # 게시판 서비스
│   │   ├── notificationService.ts
│   │   ├── voiceService.ts
│   │   └── weatherService.ts
│   │
│   ├── data/                    # 데이터 관련
│   │   ├── subwayMapData.ts    # 지하철 노선 데이터
│   │   ├── stationData.ts      # 역 데이터
│   │   ├── stationCoordinates.ts
│   │   └── stationNameMapper.ts
│   │
│   ├── utils/                   # 유틸리티 함수
│   │   ├── csvParser.ts        # CSV 파서
│   │   ├── routeUtils.ts       # 경로 유틸 (route/utils.ts에서 이동)
│   │   ├── storage.ts
│   │   └── logger.ts
│   │
│   ├── algorithms/              # 알고리즘
│   │   ├── routeAlgorithm.ts
│   │   ├── routeNormalizer.ts
│   │   └── recommendation.ts
│   │
│   ├── graph/                   # 그래프 관련
│   │   ├── buildSubwayGraph.ts
│   │   ├── crowdingWeight.ts
│   │   ├── shortestPaths.ts
│   │   └── types.ts
│   │
│   ├── ai/                      # AI 관련
│   │   ├── aiService.ts
│   │   ├── analysis.ts
│   │   └── contentGenerator.ts
│   │
│   ├── cache/                   # 캐시 관련
│   │   └── cache.ts
│   │
│   └── constants/               # 상수
│       └── utils.ts            # getLineColor 등
│
├── hooks/                       # Custom Hooks
│   ├── useFavorites.ts
│   └── useRouteSearch.ts
│
├── contexts/                    # React Context
│   └── PredictionTimeContext.tsx
│
├── types/                       # TypeScript 타입 정의
│   └── route.ts
│
├── __tests__/                   # 테스트 파일
│   ├── api.data.test.ts
│   ├── api.predict.test.ts
│   ├── api.train.test.ts
│   ├── cache.test.ts
│   ├── csvParser.test.ts
│   └── prediction.test.ts
│
├── scripts/                     # 스크립트
│   ├── debug-csv.ts
│   ├── evaluateCongestion.ts
│   └── test-station-mapping.ts
│
├── __dev__/                     # 개발/테스트 전용 (선택사항)
│   ├── test-mapping/
│   │   └── page.tsx
│   ├── train-congestion-demo/
│   │   └── page.tsx
│   └── api/
│       └── test/
│           └── mapping/
│               └── route.ts
│
├── public/                      # 정적 파일
│   └── eval/                    # 평가 데이터
│
├── docs/                        # 문서
│   └── CONGESTION_CRITERIA.md
│
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

---

## 🔄 3. 변경 작업 상세

### 3.1 삭제할 파일/폴더

#### ❌ 완전 삭제 권장
1. `app/map-new/` - map 또는 map-redesigned로 통합
2. `app/map-redesigned/` - map으로 통합 (또는 반대)
3. `app/test-mapping/` - 개발용이므로 제거 또는 `__dev__`로 이동
4. `app/train-congestion-demo/` - 개발용이므로 제거 또는 `__dev__`로 이동
5. `components/CleanSubwayMap.tsx` - 사용처 없음
6. `components/SchematicSubwayMap.tsx` - 사용처 없음
7. `components/InteractiveMap.tsx` - 사용처 없음
8. `lib/csvParserOptimized.ts` - 사용처 없음 (또는 csvParser.ts로 교체)
9. `lib/subwayMapDataComplete.ts` - 사용처 없음 (또는 subwayMapData.ts로 교체)
10. `route-standalone.html` - 사용처 불명확

#### 📦 보관할 파일 (archive)
- 삭제 전 백업을 위해 `_archive/` 폴더에 이동
- 필요시 참조 가능하도록 보관

### 3.2 이동할 파일

#### 📁 파일 이동 목록
1. `components/route/utils.ts` → `lib/utils/routeUtils.ts`
2. `app/api/test/mapping/route.ts` → `__dev__/api/test/mapping/route.ts` (또는 삭제)

### 3.3 통합할 파일

#### 🔀 통합 작업
1. **지도 페이지 통합**
   - `app/map-new/` 또는 `app/map-redesigned/` 중 하나를 `app/map/`으로 통합
   - 선택 기준: 가장 완성도 높고 최신 기능을 가진 버전

2. **지도 컴포넌트 통합**
   - `EnhancedSubwayMap`, `InteractiveSubwayMap`, `RedesignedSubwayMap` 중 하나를 `components/map/SubwayMap.tsx`로 통합
   - 나머지는 삭제 또는 archive

3. **CSV 파서 통합**
   - `csvParserOptimized.ts`가 더 나은 성능이면 `csvParser.ts`로 교체
   - 그렇지 않으면 `csvParserOptimized.ts` 삭제

4. **지하철 데이터 통합**
   - `subwayMapDataComplete.ts`가 더 완전한 데이터면 `subwayMapData.ts`로 교체
   - 그렇지 않으면 `subwayMapDataComplete.ts` 삭제

### 3.4 재구성할 폴더

#### 📂 lib 폴더 재구성
현재 `lib/` 폴더에 모든 것이 섞여 있음:
- 서비스 (api.ts, authService.ts 등)
- 유틸리티 (utils.ts, csvParser.ts 등)
- 데이터 (subwayMapData.ts, stationData.ts 등)
- 알고리즘 (routeAlgorithm.ts 등)

**재구성 방안:**
```
lib/
├── services/     # 외부 서비스 연동
├── data/         # 데이터 파일
├── utils/         # 유틸리티 함수
├── algorithms/    # 알고리즘
├── graph/         # 그래프 (유지)
├── ai/            # AI 관련 (유지)
└── cache/         # 캐시 (유지)
```

#### 📂 components 폴더 재구성
현재 `components/` 폴더에 모든 컴포넌트가 평면적으로 존재

**재구성 방안:**
```
components/
├── ui/           # 공용 UI 컴포넌트
├── map/          # 지도 관련
├── station/       # 역 관련
├── route/         # 경로 관련
├── dashboard/     # 대시보드 관련
├── board/         # 게시판 관련
├── premium/       # 프리미엄 기능
├── common/        # 공통 컴포넌트
└── train/         # 열차 관련
```

---

## 📝 4. 변경 후 얻는 이점

### 4.1 유지보수성 향상
- ✅ 중복 코드 제거로 수정 포인트 감소
- ✅ 명확한 폴더 구조로 파일 찾기 용이
- ✅ 역할별 분리로 코드 이해도 향상

### 4.2 개발 효율성 향상
- ✅ 새로운 기능 추가 시 적절한 위치 명확
- ✅ 팀원 간 코드 리뷰 및 협업 용이
- ✅ 온보딩 시간 단축

### 4.3 프로젝트 안정성 향상
- ✅ 테스트/데모 코드 제거로 프로덕션 안정성 향상
- ✅ 사용되지 않는 코드 제거로 번들 크기 감소
- ✅ 명확한 구조로 버그 발생 가능성 감소

### 4.4 확장성 향상
- ✅ 표준화된 구조로 새로운 기능 추가 용이
- ✅ 도메인별 분리로 독립적 개발 가능
- ✅ 재사용 가능한 컴포넌트 구조

---

## 🚀 5. 실행 계획 (Step-by-Step)

### Phase 1: 백업 및 준비
1. Git 브랜치 생성: `git checkout -b refactor/project-structure`
2. `_archive/` 폴더 생성 (삭제 전 백업용)

### Phase 2: 파일 이동 및 재구성
1. **lib 폴더 재구성**
   ```bash
   # services 폴더 생성 및 이동
   mkdir lib/services
   mv lib/api.ts lib/services/
   mv lib/authService.ts lib/services/
   mv lib/boardService.ts lib/services/
   mv lib/notificationService.ts lib/services/
   mv lib/voiceService.ts lib/services/
   mv lib/weatherService.ts lib/services/
   mv lib/naverMapApi.ts lib/services/
   
   # data 폴더 생성 및 이동
   mkdir lib/data
   mv lib/subwayMapData.ts lib/data/
   mv lib/subwayMapDataComplete.ts lib/data/  # 또는 삭제
   mv lib/stationData.ts lib/data/
   mv lib/stationCoordinates.ts lib/data/
   mv lib/stationNameMapper.ts lib/data/
   
   # utils 폴더 생성 및 이동
   mkdir lib/utils
   mv lib/utils.ts lib/utils/common.ts
   mv lib/csvParser.ts lib/utils/
   mv lib/csvParserOptimized.ts lib/utils/  # 또는 삭제
   mv lib/storage.ts lib/utils/
   mv lib/logger.ts lib/utils/
   mv components/route/utils.ts lib/utils/routeUtils.ts
   
   # algorithms 폴더 생성 및 이동
   mkdir lib/algorithms
   mv lib/routeAlgorithm.ts lib/algorithms/
   mv lib/routeNormalizer.ts lib/algorithms/
   mv lib/recommendation.ts lib/algorithms/
   
   # ai 폴더 생성 및 이동
   mkdir lib/ai
   mv lib/aiService.ts lib/ai/
   mv lib/analysis.ts lib/ai/
   mv lib/contentGenerator.ts lib/ai/
   
   # cache 폴더 생성 및 이동
   mkdir lib/cache
   mv lib/cache.ts lib/cache/
   ```

2. **components 폴더 재구성**
   ```bash
   # ui 폴더 생성 및 이동
   mkdir components/ui
   mv components/BottomNavigation.tsx components/ui/
   mv components/ErrorBoundary.tsx components/ui/
   mv components/ErrorMessage.tsx components/ui/
   mv components/LoadingSpinner.tsx components/ui/
   mv components/SkeletonLoader.tsx components/ui/
   mv components/Legend.tsx components/ui/
   
   # map 폴더 생성 및 통합
   mkdir components/map
   # 최신 지도 컴포넌트 하나만 선택하여 이동
   mv components/InteractiveSubwayMap.tsx components/map/SubwayMap.tsx
   # 나머지는 archive로 이동
   mv components/EnhancedSubwayMap.tsx _archive/
   mv components/RedesignedSubwayMap.tsx _archive/
   mv components/CleanSubwayMap.tsx _archive/
   mv components/SchematicSubwayMap.tsx _archive/
   mv components/InteractiveMap.tsx _archive/
   
   # station 폴더 생성 및 이동
   mkdir components/station
   mv components/CongestionCard.tsx components/station/
   mv components/CongestionVisualization.tsx components/station/
   mv components/TrainCarCongestion.tsx components/station/
   
   # route 폴더 정리 (utils.ts는 이미 이동됨)
   mkdir components/route
   mv components/RouteResultCard.tsx components/route/
   mv components/RouteScore.tsx components/route/
   
   # dashboard 폴더 생성 및 이동
   mkdir components/dashboard
   mv components/PersonalizedDashboard.tsx components/dashboard/
   mv components/PersonalizedCard.tsx components/dashboard/
   mv components/CommuteInsightCard.tsx components/dashboard/
   mv components/UserEngagementCard.tsx components/dashboard/
   
   # board 폴더 생성 및 이동
   mkdir components/board
   mv components/CommunityFeed.tsx components/board/
   
   # premium 폴더 생성 및 이동
   mkdir components/premium
   mv components/PremiumTrainCongestion.tsx components/premium/
   mv components/PremiumServiceCard.tsx components/premium/
   
   # common 폴더 생성 및 이동
   mkdir components/common
   mv components/BrandTrustFooter.tsx components/common/
   mv components/PartnershipAds.tsx components/common/
   mv components/TrendNewsCard.tsx components/common/
   mv components/VoiceButton.tsx components/common/
   mv components/ThemeProvider.tsx components/common/
   
   # train 폴더 생성 및 이동
   mkdir components/train
   mv components/TrainCarVisualization.tsx components/train/
   ```

3. **app 폴더 정리**
   ```bash
   # 지도 페이지 통합 (하나만 선택)
   # 예: map-new를 메인으로 사용
   cp app/map-new/page.tsx app/map/page.tsx
   # 나머지는 archive로 이동
   mv app/map-new _archive/
   mv app/map-redesigned _archive/
   
   # 테스트/데모 페이지 제거 또는 이동
   mkdir -p __dev__
   mv app/test-mapping __dev__/
   mv app/train-congestion-demo __dev__/
   
   # 테스트 API 제거 또는 이동
   mkdir -p __dev__/api/test
   mv app/api/test/mapping __dev__/api/test/
   ```

### Phase 3: Import 경로 수정
모든 파일의 import 경로를 새로운 구조에 맞게 수정:

1. **lib 경로 수정 예시**
   ```typescript
   // 변경 전
   import { getStationCongestion } from '@/lib/api';
   import { getLineColor } from '@/lib/utils';
   import { STATIONS } from '@/lib/subwayMapData';
   
   // 변경 후
   import { getStationCongestion } from '@/lib/services/api';
   import { getLineColor } from '@/lib/utils/common';
   import { STATIONS } from '@/lib/data/subwayMapData';
   ```

2. **components 경로 수정 예시**
   ```typescript
   // 변경 전
   import BottomNavigation from '@/components/BottomNavigation';
   import EnhancedSubwayMap from '@/components/EnhancedSubwayMap';
   
   // 변경 후
   import BottomNavigation from '@/components/ui/BottomNavigation';
   import SubwayMap from '@/components/map/SubwayMap';
   ```

3. **자동화 스크립트 사용**
   - VS Code의 "Find and Replace in Files" 기능 활용
   - 또는 정규식 기반 일괄 치환

### Phase 4: 테스트 및 검증
1. 모든 페이지 접근 테스트
2. 모든 기능 동작 확인
3. 빌드 테스트: `npm run build`
4. 타입 체크: `npx tsc --noEmit`

### Phase 5: 정리 및 문서화
1. README.md 업데이트
2. 변경 사항 문서화
3. Git 커밋 및 PR 생성

---

## ⚠️ 6. 주의사항

### 6.1 Import 경로 수정
- 모든 파일의 import 경로를 일괄 수정해야 함
- TypeScript 컴파일 오류 확인 필수
- 빌드 테스트 필수

### 6.2 기능 유지
- 기능은 그대로 유지하면서 구조만 변경
- 각 단계마다 테스트 진행
- Git 커밋을 단계별로 진행하여 롤백 가능하도록

### 6.3 팀 협의
- 주요 변경 사항은 팀과 협의 후 진행
- 특히 삭제할 파일은 팀원 확인 후 진행

---

## 📊 7. 변경 전후 비교

### 변경 전
- 중복된 파일: 10개 이상
- 불명확한 구조: lib 폴더에 모든 것 혼재
- 테스트 코드 프로덕션 포함
- 컴포넌트 평면 구조

### 변경 후
- 중복 제거: 단일 버전만 유지
- 명확한 구조: 역할별 폴더 분리
- 테스트 코드 분리: __dev__ 폴더
- 컴포넌트 도메인별 구조

---

## 🎯 8. 최종 권장 사항

1. **즉시 실행 가능한 작업**
   - 사용되지 않는 파일 삭제 (CleanSubwayMap, SchematicSubwayMap 등)
   - 테스트/데모 페이지 `__dev__` 폴더로 이동

2. **단계별 진행 권장 작업**
   - lib 폴더 재구성 (services, data, utils 분리)
   - components 폴더 재구성 (도메인별 분리)
   - 지도 페이지/컴포넌트 통합

3. **팀 협의 후 진행 권장**
   - 어떤 지도 버전을 메인으로 사용할지 결정
   - csvParserOptimized vs csvParser 선택
   - subwayMapDataComplete vs subwayMapData 선택

---

이 문서를 기반으로 프로젝트 구조를 단계적으로 정리하시기 바랍니다. 각 단계마다 테스트를 진행하고, Git 커밋을 통해 변경 사항을 추적하세요.




