'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, User, Menu, MapPin, Navigation, RefreshCw, ArrowRight, Users, TrendingDown, TrendingUp, X, Train, BarChart3, Star } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import Legend from '@/components/Legend';
import LoadingSpinner from '@/components/LoadingSpinner';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import { getCurrentUser } from '@/lib/authService';
import { getNotificationSettings } from '@/lib/notificationService';
import { getWeatherData, getEventData } from '@/lib/weatherService';
import { findNearbyStations, StationCoordinate } from '@/lib/stationCoordinates';
import { getLineColor } from '@/lib/utils';
import { LINE_COLORS, getStationByName } from '@/lib/subwayMapData';
import { getStationCongestion, calculateCongestionLevel } from '@/lib/api';
import { useFavorites } from '@/hooks/useFavorites';
import { logger } from '@/lib/logger';
import { random } from '@/lib/random';

interface NearbyStation extends StationCoordinate {
  distance: number;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [nearbyStations, setNearbyStations] = useState<NearbyStation[]>([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set()); // 접힌 섹션들
  
  // 기준역 정보 상태
  const [currentStation, setCurrentStation] = useState<{ stationName: string; lineNum: string } | null>(null);
  const [currentCongestion, setCurrentCongestion] = useState<{ level: string; color: string; value: number } | null>(null);
  const [averageWaitTime, setAverageWaitTime] = useState<number>(0);
  const [hasIssues, setHasIssues] = useState<boolean>(false);
  interface CarCongestion {
    carNo: number;
    congestionLevel: string;
    value: number;
  }
  const [carCongestionData, setCarCongestionData] = useState<{ up: CarCongestion[]; down: CarCongestion[] }>({ up: [], down: [] });
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down'>('up');
  
  // 즐겨찾기 훅
  const { 
    favoriteStations, 
    addFavoriteStation, 
    removeFavoriteStation,
    isFavoriteStation
  } = useFavorites();

  // 로그인 상태 업데이트 함수 (메모이제이션)
  const updateUserState = useCallback(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    setMounted(true);
    updateUserState();
    
    const notificationSettings = getNotificationSettings();
    setNotificationsEnabled(notificationSettings.enabled);
    
    loadWeatherAndEvents();
    getCurrentLocation();

    // 로그인 상태 변경 이벤트 리스너 추가
    const handleAuthStateChanged = () => {
      updateUserState();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-state-changed', handleAuthStateChanged);
      // storage 이벤트도 감지 (다른 탭에서 로그인한 경우)
      window.addEventListener('storage', handleAuthStateChanged);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-state-changed', handleAuthStateChanged);
        window.removeEventListener('storage', handleAuthStateChanged);
      }
    };
  }, [updateUserState]);

  // 기준역 정보 로드 (메모이제이션)
  const loadCurrentStationInfo = useCallback(async () => {
    if (nearbyStations.length === 0) {
      // nearbyStations가 없으면 빈 데이터로 설정
      setCarCongestionData({ up: [], down: [] });
      return;
    }
    
    const baseStation = { stationName: nearbyStations[0].name, lineNum: nearbyStations[0].lineNum };
    setCurrentStation(baseStation);
    
    try {
      // 현재 역 혼잡도 (타임아웃 시 기본값 사용)
      let congestionData;
      let passengerCount = 500; // 기본값
      
      try {
        congestionData = await getStationCongestion(baseStation.stationName, baseStation.lineNum, 5000);
        passengerCount = congestionData?.CardSubwayStatsNew?.row?.[0]?.RIDE_PASGR_NUM || 500;
      } catch (error: any) {
        // 타임아웃이나 네트워크 에러 시 기본값 사용
        logger.warn('역 혼잡도 조회 실패, 기본값 사용', {
          stationName: baseStation.stationName,
          lineNum: baseStation.lineNum,
          error: error?.message || String(error),
        });
        passengerCount = 500;
      }
      
      const congestion = calculateCongestionLevel(passengerCount);
      setCurrentCongestion(congestion);
      
      // 평균 대기 시간 계산
      const waitTime = Math.round(passengerCount / 100);
      setAverageWaitTime(waitTime);
      
      // 칸별 혼잡도 데이터 로드
      const [upResponse, downResponse] = await Promise.all([
        fetch(`/api/train/congestion?line=${encodeURIComponent(baseStation.lineNum)}&station=${encodeURIComponent(baseStation.stationName)}&direction=UP`).catch(() => null),
        fetch(`/api/train/congestion?line=${encodeURIComponent(baseStation.lineNum)}&station=${encodeURIComponent(baseStation.stationName)}&direction=DOWN`).catch(() => null),
      ]);
      
      let upCars: CarCongestion[] = [];
      let downCars: CarCongestion[] = [];
      
      if (upResponse?.ok) {
        try {
          const upResult = await upResponse.json() as { success: boolean; data?: { cars?: CarCongestion[] } };
          if (upResult.success && upResult.data?.cars) {
            upCars = upResult.data.cars;
          }
        } catch (e) {
          logger.error('상행 데이터 파싱 실패', e as Error);
        }
      }
      
      if (downResponse?.ok) {
        try {
          const downResult = await downResponse.json() as { success: boolean; data?: { cars?: CarCongestion[] } };
          if (downResult.success && downResult.data?.cars) {
            downCars = downResult.data.cars;
          }
        } catch (e) {
          logger.error('하행 데이터 파싱 실패', e as Error);
        }
      }
      
      setCarCongestionData({
        up: upCars,
        down: downCars,
      });
    } catch (error) {
      logger.error('기준역 정보 로드 실패', error as Error);
    }
  }, [nearbyStations]);

  useEffect(() => {
    if (nearbyStations.length > 0) {
      loadCurrentStationInfo();
    }
  }, [nearbyStations, loadCurrentStationInfo]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('GPS를 지원하지 않는 브라우저입니다.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        
        // 반경 2km 내 역 찾기
        const nearby = findNearbyStations(latitude, longitude, 2.0);
        setNearbyStations(nearby);
        
        // 기준역 정보 로드
        if (nearby.length > 0) {
          loadCurrentStationInfo();
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error('위치 정보 가져오기 실패:', error);
        let errorMessage = '위치 정보를 가져올 수 없습니다.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleStationClick = useCallback((station: NearbyStation) => {
    router.push(`/stations/${station.name}_${station.lineNum}`);
  }, [router]);

  const loadWeatherAndEvents = useCallback(async () => {
    try {
      const weatherData = await getWeatherData();
      const eventData = await getEventData();
      setWeather(weatherData);
      setEvents(eventData);
    } catch (error) {
      logger.error('날씨/이벤트 데이터 로드 실패', error as Error);
    }
  }, []);

  // 혼잡도 색상/텍스트 (메모이제이션)
  const getCongestionColor = useCallback((level: number): string => {
    switch (level) {
      case 1: return '#4CAF50'; // 여유
      case 2: return '#FFC107'; // 보통
      case 3: return '#FF9800'; // 주의
      case 4: return '#F44336'; // 매우 혼잡
      default: return '#9E9E9E';
    }
  }, []);

  const getCongestionText = useCallback((level: number): string => {
    switch (level) {
      case 1: return '여유';
      case 2: return '보통';
      case 3: return '주의';
      case 4: return '매우 혼잡';
      default: return '알 수 없음';
    }
  }, []);


  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-gray-900">
      {/* 미니멀 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">대시보드</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/stations"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="역 검색"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
              </Link>
              <Link
                href="/analytics"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="모델 성능 평가"
              >
                <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
              </Link>
              {user ? (
                <Link
                  href="/settings"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  title="설정"
                >
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  title="로그인"
                >
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Link>
              )}
              <Link
                href="/settings"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
              >
                <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
                {notificationsEnabled && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>


      {/* 즐겨찾기 섹션 (모든 탭에서 표시) */}
      {favoriteStations.length > 0 && (
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              자주 찾는 역
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {favoriteStations.slice(0, 5).map((fav, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(`/stations/${fav.stationName}_${fav.lineNum || '1'}`)}
                  className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {fav.stationName}
                  {fav.lineNum && <span className="text-xs">({fav.lineNum}호선)</span>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* 내 주변 역 리스트 */}
      {
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-b border-blue-200 dark:border-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">내 주변 역</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">나에게 맞춤 정보</p>
                </div>
              {userLocation && nearbyStations.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    (반경 2km · {nearbyStations.length}개)
                </span>
              )}
              {userLocation && nearbyStations.length === 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    (반경 2km)
                </span>
              )}
            </div>
            <button
              onClick={getCurrentLocation}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="위치 새로고침"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${locationLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {locationLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="md" text="위치 정보를 가져오는 중..." />
            </div>
          ) : locationError ? (
            <div className="py-4">
              <ErrorMessage
                title="위치 정보를 가져올 수 없습니다"
                message={locationError}
                onRetry={getCurrentLocation}
                severity="warning"
              />
            </div>
          ) : nearbyStations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                반경 2km 내에 지하철역이 없습니다.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                다른 위치에서 시도해주세요.
              </p>
            </div>
          ) : (
            <div>
              {/* 내 주변 역 리스트 */}
              <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                {nearbyStations.slice(0, 10).map((station, index) => (
                <button
                  key={`${station.name}-${station.lineNum}-${index}`}
                  onClick={() => handleStationClick(station)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md text-left bg-white/80 dark:bg-gray-800/80"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: getLineColor(station.lineNum) }}
                  >
                    {station.lineNum}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {station.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {station.lineNum}호선
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Navigation className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {station.distance < 0.1 
                          ? `${Math.round(station.distance * 1000)}m`
                          : `${station.distance.toFixed(2)}km`
                        }
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
              </div>
              
              {/* 나에게 맞춤 정보 섹션 - 이미지와 동일한 레이아웃 */}
              <div className="space-y-4">
                {/* 기준역 정보 카드 - 이미지와 동일한 레이아웃 */}
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg border border-gray-100 p-6 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <div className="text-sm opacity-90 mb-1">기준역</div>
                      <div className="text-lg font-semibold mb-4">
                        {currentStation ? `${currentStation.stationName}역` : nearbyStations[0] ? `${nearbyStations[0].name}역` : '역 정보 없음'}
                      </div>
                      <div className="text-sm opacity-90 mb-1">현재 시간대 혼잡도</div>
                      <div className="text-2xl font-bold mb-4">
                        {currentCongestion?.level || '보통'}
                      </div>
                      <div className="pt-4 border-t border-white/20">
                        <div className="text-sm opacity-90 mb-1">지금 추천</div>
                        <div className="text-lg font-semibold">
                          {currentCongestion?.level === '여유' ? '1~3칸' : currentCongestion?.level === '보통' ? '4~6칸' : '7~10칸'} · {currentCongestion?.level === '여유' ? '여유로운 칸' : currentCongestion?.level === '보통' ? '보통 혼잡도' : '주의 혼잡도'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm opacity-90 mb-1">현재 시간</div>
                        <div className="text-lg font-semibold">
                          {String(new Date().getHours()).padStart(2, '0')}시 {String(new Date().getMinutes()).padStart(2, '0')}분
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-90 mb-1">평균 대기</div>
                        <div className="text-lg font-semibold">{averageWaitTime}분</div>
                      </div>
                      <div>
                        <div className="text-sm opacity-90 mb-1">지연/이슈</div>
                        <div className={`text-lg font-semibold ${hasIssues ? 'text-red-200' : 'text-green-200'}`}>
                          {hasIssues ? '있음' : '없음'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              
              {/* 칸별 혼잡도 예측 - 이미지와 동일한 레이아웃 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Train className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">칸별 혼잡도 예측</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currentStation ? `${currentStation.stationName}역 · ${currentStation.lineNum}호선` : nearbyStations[0] ? `${nearbyStations[0].name}역 · ${nearbyStations[0].lineNum}호선` : '역 정보 없음'}
                    </span>
                  </div>
                    <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDirection('up')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        selectedDirection === 'up'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      aria-label="상행 방향 선택"
                      aria-pressed={selectedDirection === 'up'}
                    >
                      상행
                    </button>
                    <button
                      onClick={() => setSelectedDirection('down')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        selectedDirection === 'down'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      aria-label="하행 방향 선택"
                      aria-pressed={selectedDirection === 'down'}
                    >
                      하행
                    </button>
                  </div>
                </div>
                
                {carCongestionData[selectedDirection].length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {carCongestionData[selectedDirection].map((car: any, index: number) => {
                        const getCongestionColor = (level: string) => {
                          switch (level) {
                            case '여유':
                              return 'bg-green-500';
                            case '보통':
                              return 'bg-yellow-500';
                            case '주의':
                              return 'bg-orange-500';
                            case '혼잡':
                              return 'bg-red-500';
                            default:
                              return 'bg-gray-300';
                          }
                        };
                        
                        const isRecommended = car.congestionLevel === '여유' || car.congestionLevel === '보통';
                        const carNo = car.carNo || car.carNumber || `${index + 1}칸`;
                        const value = car.value || car.congestionPercent || 0;
                        const congestionLevel = car.congestionLevel || '보통';
                        
                        return (
                          <div
                            key={index}
                            className="relative rounded-lg p-3 text-center transition-all hover:scale-105 cursor-pointer"
                            style={{
                              backgroundColor: congestionLevel === '여유' ? '#dcfce7' :
                                              congestionLevel === '보통' ? '#fef9c3' :
                                              congestionLevel === '주의' ? '#fed7aa' : '#fee2e2',
                            }}
                          >
                            {/* 체크마크 - 모든 추천 칸에 표시 */}
                            {isRecommended && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-[8px]">✓</span>
                              </div>
                            )}
                            <div className="text-xs font-bold text-gray-700 mb-1">
                              {carNo}
                            </div>
                            <div className={`h-16 rounded ${getCongestionColor(congestionLevel)} mb-2 flex items-center justify-center`}>
                              <span className="text-white text-xs font-bold">
                                {value}%
                              </span>
                            </div>
                            <div className="text-xs font-medium" style={{
                              color: congestionLevel === '여유' ? '#166534' :
                                     congestionLevel === '보통' ? '#854d0e' :
                                     congestionLevel === '주의' ? '#9a3412' : '#991b1b',
                            }}>
                              {congestionLevel}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <span>여유</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-500"></div>
                        <span>보통</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-500"></div>
                        <span>주의</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span>혼잡</span>
                      </div>
                      <div className="ml-auto text-blue-600 dark:text-blue-400 font-medium">
                        <span className="text-green-600">✓</span> 표시된 칸 추천
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    칸별 혼잡도 데이터를 불러오는 중...
                  </div>
                )}
              </div>
              </div>
            </div>
          )}
        </div>
      </section>
      }

      <BottomNavigation />
      <Legend />
      <div className="h-20"></div>
    </div>
  );
}

