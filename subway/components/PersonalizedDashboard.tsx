'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Clock, TrendingUp, TrendingDown, MapPin, Train, Star, 
  Bell, ArrowRight, Zap, AlertTriangle, MessageSquare, 
  Crown, Smile, Meh, Frown, ChevronRight, Activity,
  Users, Sparkles, BarChart3
} from 'lucide-react';
import { getFavoriteStations } from '@/lib/storage';
import { getStationCongestion, calculateCongestionLevel, predictCongestion } from '@/lib/api';
import { getLineColor } from '@/lib/utils';
import { analyzeUserPattern } from '@/lib/personalizationService';
import { getCurrentUser } from '@/lib/authService';
import { getPosts } from '@/lib/boardService';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { random } from '@/lib/random';

interface NearbyStation {
  name: string;
  lineNum: string;
  distance: number;
}

interface PersonalizedDashboardProps {
  nearbyStations?: NearbyStation[];
  userLocation?: { lat: number; lon: number } | null;
}

export default function PersonalizedDashboard({ nearbyStations = [], userLocation = null }: PersonalizedDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [favoriteStations, setFavoriteStations] = useState<any[]>([]);
  const [currentStation, setCurrentStation] = useState<any>(null);
  const [currentCongestion, setCurrentCongestion] = useState<any>(null);
  const [averageWaitTime, setAverageWaitTime] = useState<number>(0);
  const [hasIssues, setHasIssues] = useState<boolean>(false);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [lineTrends, setLineTrends] = useState<any[]>([]);
  const [commuteReport, setCommuteReport] = useState<any>(null);
  const [seoulIssues, setSeoulIssues] = useState<any[]>([]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [myUsageTimeline, setMyUsageTimeline] = useState<any[]>([]);
  const [userComparison, setUserComparison] = useState<any>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [carCongestionData, setCarCongestionData] = useState<{ up: any[]; down: any[] }>({ up: [], down: [] });
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down'>('up');

  // 로그인 상태 업데이트 함수
  const updateUserState = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    setMounted(true);
    updateUserState();
    loadDashboardData();
    
    // 로그인 상태 변경 이벤트 리스너 추가
    const handleAuthStateChanged = () => {
      updateUserState();
      loadDashboardData(); // 로그인 상태 변경 시 데이터 다시 로드
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-state-changed', handleAuthStateChanged);
      window.addEventListener('storage', handleAuthStateChanged);
    }
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, 60000); // 1분마다 갱신
    
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-state-changed', handleAuthStateChanged);
        window.removeEventListener('storage', handleAuthStateChanged);
      }
    };
  }, [nearbyStations]); // nearbyStations가 변경되면 기준역 업데이트

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 최신 로그인 상태 확인 (user 상태가 업데이트되지 않았을 수 있으므로 직접 확인)
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser); // 상태 동기화
      }
      
      // 즐겨찾기 역
      const favorites = getFavoriteStations();
      setFavoriteStations(favorites);
      
      // 기준역 설정 (주변 역 중 첫 번째 역 우선, 없으면 즐겨찾기 첫 번째 역, 없으면 기본값)
      let baseStation;
      if (nearbyStations && nearbyStations.length > 0) {
        // 주변 역 중 가장 가까운 역을 기준역으로 설정
        baseStation = { stationName: nearbyStations[0].name, lineNum: nearbyStations[0].lineNum };
      } else if (favorites.length > 0) {
        baseStation = favorites[0];
      } else {
        baseStation = { stationName: '노량진', lineNum: '1' };
      }
      setCurrentStation(baseStation);
      
      // 현재 역 혼잡도
      const congestionData = await getStationCongestion(baseStation.stationName, baseStation.lineNum);
      const passengerCount = congestionData?.CardSubwayStatsNew?.row?.[0]?.RIDE_PASGR_NUM || 500;
      const congestion = calculateCongestionLevel(passengerCount);
      setCurrentCongestion(congestion);
      
      // 평균 대기 시간 계산
      const waitTime = Math.round(passengerCount / 100);
      setAverageWaitTime(waitTime);
      
      // 칸별 혼잡도 데이터 로드
      try {
        const [upResponse, downResponse] = await Promise.all([
          fetch(`/api/train/congestion?line=${encodeURIComponent(baseStation.lineNum)}&station=${encodeURIComponent(baseStation.stationName)}&direction=UP`).catch(err => {
            console.error('상행 API 호출 실패:', err);
            return null;
          }),
          fetch(`/api/train/congestion?line=${encodeURIComponent(baseStation.lineNum)}&station=${encodeURIComponent(baseStation.stationName)}&direction=DOWN`).catch(err => {
            console.error('하행 API 호출 실패:', err);
            return null;
          }),
        ]);
        
        let upCars: any[] = [];
        let downCars: any[] = [];
        
        if (upResponse && upResponse.ok) {
          try {
            const upResult = await upResponse.json();
            if (upResult.success && upResult.data?.cars) {
              upCars = upResult.data.cars;
            }
          } catch (err) {
            console.error('상행 데이터 파싱 실패:', err);
          }
        }
        
        if (downResponse && downResponse.ok) {
          try {
            const downResult = await downResponse.json();
            if (downResult.success && downResult.data?.cars) {
              downCars = downResult.data.cars;
            }
          } catch (err) {
            console.error('하행 데이터 파싱 실패:', err);
          }
        }
        
        // 데이터가 없어도 빈 배열로 설정하여 로딩 상태 해제
        setCarCongestionData({
          up: upCars,
          down: downCars,
        });
      } catch (error) {
        console.error('칸별 혼잡도 데이터 로드 실패:', error);
        // 에러 발생 시에도 빈 배열로 설정하여 로딩 상태 해제
        setCarCongestionData({
          up: [],
          down: [],
        });
      }
      
      // 이슈 여부 (모의 데이터) - 위에서 이미 정의된 currentUser 재사용
      const userContext = currentUser?.id || 'anonymous';
      setHasIssues(random.contextRandom(`issues-${userContext}`) > 0.8);
      
      // 주간 혼잡도 트렌드
      const trendData = ['월', '화', '수', '목', '금', '토', '일'].map((day, index) => ({
        day,
        congestion: index < 5 
          ? 70 + random.contextRandomFloat(`trend-${userContext}-${day}`, 0, 10)
          : 40 + random.contextRandomFloat(`trend-${userContext}-${day}`, 0, 10),
      }));
      setWeeklyTrend(trendData);
      
      // 노선별 트렌드 (전체 노선 1-9호선)
      const lines = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
      const lineTrendData = lines.map(line => ({
        line,
        congestion: 50 + random.contextRandomFloat(`line-${userContext}-${line}`, 0, 30),
        change: random.contextRandomFloat(`line-change-${userContext}-${line}`, -5, 5),
      }));
      setLineTrends(lineTrendData);
      
      // AI 출퇴근 리포트 (로그인 사용자만) - currentUser 사용
      if (currentUser?.id) {
        // 리포트 생성 (무조건 생성, 패턴 분석은 선택적)
        const lastWeekAvg = 65;
        const thisWeekAvg = 60;
        const diff = thisWeekAvg - lastWeekAvg;
        
        try {
          const pattern = analyzeUserPattern(currentUser.id);
          
          // 나의 이용 요약 타임라인
          const timeline = [
            { time: '07:30', station: '노량진', line: '1', congestion: '보통' },
            { time: '08:15', station: '시청', line: '1', congestion: '혼잡' },
            { time: '18:30', station: '시청', line: '1', congestion: '혼잡' },
            { time: '19:00', station: '노량진', line: '1', congestion: '보통' },
          ];
          setMyUsageTimeline(timeline);
          
          // 이용자 평균 비교
          setUserComparison({
            myAverage: 65,
            userAverage: 70,
            difference: -5,
          });
        } catch (error) {
          console.error('패턴 분석 중 오류:', error);
          // 에러 발생해도 리포트는 생성
        }
        
        // 리포트 생성 (무조건 실행)
        setCommuteReport({
          averageTime: thisWeekAvg,
          diff: diff,
          recommendedTimes: [
            { time: '7:30', congestion: '보통' },
            { time: '8:15', congestion: '여유' },
            { time: '9:00', congestion: '보통' },
          ],
        });
        
        console.log('리포트 생성 완료:', { averageTime: thisWeekAvg, diff });
      } else {
        // 로그인하지 않은 경우 리포트 초기화
        setCommuteReport(null);
      }
      
      // AI 제안 메시지
      const suggestions = [
        '오늘은 평소보다 10분 일찍 출발하시면 여유롭게 탑승하실 수 있어요 🚇',
        '현재 2호선이 평소보다 혼잡합니다. 1호선 환승을 고려해보세요 💡',
        '주말에는 평일 대비 30% 여유롭습니다. 여유로운 시간대를 이용하세요 ✨',
      ];
      const suggestionIndex = random.contextRandomInt(`suggestion-${userContext}`, 0, suggestions.length - 1);
      setAiSuggestion(suggestions[suggestionIndex]);
      
      // 서울 전체 이슈/공지
      setSeoulIssues([
        { line: '2', message: '강남역 점검 완료', type: 'info' },
        { line: '4', message: '사당역 승강장 공사 중', type: 'warning' },
      ]);
      
      // 커뮤니티 인기 글
      const allPosts = getPosts();
      const popular = [...allPosts]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 2);
      setPopularPosts(popular);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmotionSelect = async (emotion: 'happy' | 'neutral' | 'sad') => {
    setSelectedEmotion(emotion);
    
    // 피드백 저장 (localStorage 기반, 향후 API 연동 가능)
    try {
      const feedbackData = {
        emotion,
        timestamp: new Date().toISOString(),
        user: user?.email || 'anonymous',
      };
      
      const existingFeedback = localStorage.getItem('userFeedback');
      const feedbacks = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbacks.push(feedbackData);
      
      // 최근 100개만 저장
      const recentFeedbacks = feedbacks.slice(-100);
      localStorage.setItem('userFeedback', JSON.stringify(recentFeedbacks));
      
      // TODO: 향후 실제 API 호출로 피드백 저장
      // await fetch('/api/feedback', { method: 'POST', body: JSON.stringify(feedbackData) });
    } catch (error) {
      console.error('피드백 저장 실패:', error);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-20">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* AI 제안 메시지 (상단 고정) */}
        {aiSuggestion && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <p className="text-sm text-[#111827] font-medium">{aiSuggestion}</p>
            </div>
          </div>
        )}

        {/* [1층] 공통 정보 */}
        <section>
          <h2 className="text-lg font-semibold text-[#111827] mb-4">전체 혼잡도 & 트렌드</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 전체 혼잡도 트렌드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-[#2563eb]" />
                <h3 className="text-lg font-semibold text-[#111827]">주간 혼잡도 트렌드</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyTrend}>
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="congestion"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 노선별 트렌드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Train className="w-5 h-5 text-[#2563eb]" />
                <h3 className="text-lg font-semibold text-[#111827]">노선별 혼잡도</h3>
                <span className="text-xs text-slate-500">(전체 노선)</span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {lineTrends.map((line, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: getLineColor(line.line) }}
                      >
                        {line.line}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#111827]">{line.line}호선</div>
                        <div className="text-xs text-slate-500">
                          {line.congestion.toFixed(0)}% 혼잡
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium flex-shrink-0 ${line.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {line.change > 0 ? '+' : ''}{line.change.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 서울 전체 이슈/공지 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#2563eb]" />
                <h3 className="text-lg font-semibold text-[#111827]">서울 전체 이슈/공지</h3>
              </div>
              {seoulIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {seoulIssues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: getLineColor(issue.line) }}
                      >
                        {issue.line}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#111827]">
                          {issue.message}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {issue.type === 'warning' ? '점검 중' : '완료'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  현재 이슈가 없습니다.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* [2층] 사용자 맞춤 정보 - AI 출퇴근 리포트 */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI 출퇴근 리포트 */}
            {user?.id ? (
              commuteReport ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-[#2563eb]" />
                    <h3 className="text-lg font-semibold text-[#111827]">AI 출퇴근 리포트</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">이번 주 평균 출근 시간</div>
                      <div className="text-2xl font-bold text-[#111827]">
                        {commuteReport.averageTime}분
                      </div>
                      <div className={`text-sm mt-1 ${commuteReport.diff < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {commuteReport.diff < 0 ? '↓' : '↑'} 지난주 대비 {Math.abs(commuteReport.diff)}분
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-sm text-slate-500 mb-3">추천 출발 시간</div>
                      <div className="flex flex-wrap gap-2">
                        {commuteReport.recommendedTimes.map((item: any, index: number) => (
                          <button
                            key={index}
                            className="px-3 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
                          >
                            {item.time} ({item.congestion})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-[#2563eb]" />
                    <h3 className="text-lg font-semibold text-[#111827]">AI 출퇴근 리포트</h3>
                  </div>
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb] mx-auto mb-4"></div>
                    <p className="text-sm text-slate-500">
                      리포트를 생성하는 중...
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-[#2563eb]" />
                  <h3 className="text-lg font-semibold text-[#111827]">AI 출퇴근 리포트</h3>
                </div>
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-4">
                    로그인하시면 맞춤형 출퇴근 리포트를 받아보실 수 있어요
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
                  >
                    로그인하기
                  </button>
                </div>
              </div>
            )}

            {/* 나의 이용 요약 타임라인 */}
            {user?.id && myUsageTimeline.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#2563eb]" />
                  <h3 className="text-lg font-semibold text-[#111827]">나의 이용 요약</h3>
                </div>
                <div className="space-y-3">
                  {myUsageTimeline.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-[#2563eb]"></div>
                        {index < myUsageTimeline.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#111827]">
                          {item.time} · {item.station}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.line}호선 · {item.congestion}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 이용자 평균 비교 */}
            {user?.id && userComparison ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#2563eb]" />
                  <h3 className="text-lg font-semibold text-[#111827]">이용자 평균 비교</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">내 평균 대기 시간</div>
                    <div className="text-2xl font-bold text-[#111827]">
                      {userComparison.myAverage}분
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-sm text-slate-500 mb-1">전체 이용자 평균</div>
                    <div className="text-xl font-bold text-[#111827]">
                      {userComparison.userAverage}분
                    </div>
                    <div className={`text-sm mt-1 ${userComparison.difference < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {userComparison.difference < 0 ? '↓' : '↑'} 평균보다 {Math.abs(userComparison.difference)}분 {userComparison.difference < 0 ? '빠름' : '느림'}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* [3층] 참여/확장 정보 */}
        <section>
          <h2 className="text-lg font-semibold text-[#111827] mb-4">참여 & 확장</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 커뮤니티 인기 글 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#2563eb]" />
                  <h3 className="text-lg font-semibold text-[#111827]">커뮤니티 인기 글</h3>
                </div>
                <Link
                  href="/board"
                  className="text-sm text-[#2563eb] hover:text-[#1d4ed8] font-medium"
                >
                  더보기
                </Link>
              </div>
              {popularPosts.length > 0 ? (
                <div className="space-y-3">
                  {popularPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/board/${post.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#2563eb]/10 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-[#2563eb]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#111827] line-clamp-1 mb-1">
                            {post.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>좋아요 {post.likes}</span>
                            <span>·</span>
                            <span>{post.author}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  인기 글이 없습니다.
                </div>
              )}
            </div>

            {/* 사용자 참여 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#111827] mb-4">오늘 탑승 경험</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">어땠나요?</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEmotionSelect('happy')}
                    className={`p-3 rounded-full transition-all hover:scale-110 ${
                      selectedEmotion === 'happy' 
                        ? 'bg-green-100 scale-110' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Smile className={`w-6 h-6 ${selectedEmotion === 'happy' ? 'text-green-600' : 'text-gray-400'}`} />
                  </button>
                  <button
                    onClick={() => handleEmotionSelect('neutral')}
                    className={`p-3 rounded-full transition-all hover:scale-110 ${
                      selectedEmotion === 'neutral' 
                        ? 'bg-yellow-100 scale-110' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Meh className={`w-6 h-6 ${selectedEmotion === 'neutral' ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </button>
                  <button
                    onClick={() => handleEmotionSelect('sad')}
                    className={`p-3 rounded-full transition-all hover:scale-110 ${
                      selectedEmotion === 'sad' 
                        ? 'bg-red-100 scale-110' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Frown className={`w-6 h-6 ${selectedEmotion === 'sad' ? 'text-red-600' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* 프리미엄 안내 */}
            <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-2xl shadow-sm p-6 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-yellow-300" />
                  <div>
                    <div className="text-white font-semibold text-sm mb-1">
                      프리미엄: AI 맞춤 알림과 리포트를 사용해 보세요.
                    </div>
                    <div className="text-white/80 text-xs">
                      개인화된 혼잡도 예측과 최적 경로 추천을 받아보세요
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/settings')}
                  className="px-4 py-2 bg-white text-[#2563eb] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  구독 관리
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
