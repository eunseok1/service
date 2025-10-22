# -*- coding: utf-8 -*-
"""
서울 지하철 혼잡도 UI - 실제 데이터 기반 대시보드
"""

import streamlit as st
import streamlit.components.v1 as components
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import folium
import os
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# 페이지 설정
st.set_page_config(
    page_title="서울 지하철 혼잡도 대시보드 - 실제 데이터",
    page_icon="🚇",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS 스타일링
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #e6e9ef;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    .congestion-very-low { color: #2E8B57; font-weight: bold; }
    .congestion-low { color: #32CD32; font-weight: bold; }
    .congestion-normal { color: #FFD700; font-weight: bold; }
    .congestion-high { color: #FF8C00; font-weight: bold; }
    .congestion-very-high { color: #FF4500; font-weight: bold; }
    .data-info {
        background-color: #1f2937; /* dark bg */
        color: #f8fafc; /* light text */
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        border-left: 4px solid #60a5fa; /* accent */
    }
    .data-info h3 { color: #93c5fd; margin-top: 0; }
    .data-info p { margin: 0.25rem 0; }

    /* Light mode adjustments */
    @media (prefers-color-scheme: light) {
        .data-info {
            background-color: #dbeafe; /* light blue */
            color: #0f172a; /* dark text */
            border-left-color: #1f77b4;
        }
        .data-info h3 { color: #1f77b4; }
    }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def load_data():
    """실제 데이터 로드"""
    try:
        # 실제 데이터 파일 로드 (여러 경로 시도)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        candidate_files = [
            os.path.join(base_dir, 'dataset', 'combined_subway_weather_data.csv'),
            os.path.join(os.getcwd(), 'dataset', 'combined_subway_weather_data.csv'),
            os.path.join(base_dir, 'data', 'processed', 'combined_subway_weather_data.csv'),
            os.path.join(os.getcwd(), 'data', 'processed', 'combined_subway_weather_data.csv'),
            os.path.join(base_dir, 'dataset', 'seoul_subway_weather_data.xlsx'),
            os.path.join(os.getcwd(), 'dataset', 'seoul_subway_weather_data.xlsx'),
        ]
        data_file = next((p for p in candidate_files if os.path.exists(p)), None)
        if data_file:
            if data_file.lower().endswith('.xlsx'):
                df = pd.read_excel(data_file)
            else:
                df = pd.read_csv(data_file, encoding='utf-8-sig')
            
            # 데이터 전처리
            df['date'] = pd.to_datetime(df['date'])
            df['hour'] = df['date'].dt.hour
            df['month'] = df['date'].dt.month
            df['weekday'] = df['date'].dt.day_name()
            
            # 누락 컬럼 보강
            if 'total_passengers' not in df.columns:
                if 'congestion_rate' in df.columns:
                    # 혼잡도 비율을 기준으로 대략적 승객 수 추정 (스케일링)
                    df['total_passengers'] = pd.to_numeric(df['congestion_rate'], errors='coerce').fillna(0) * 100
                else:
                    df['total_passengers'] = 0
            if 'weather_condition' not in df.columns:
                df['weather_condition'] = 'N/A'
            if 'temperature' not in df.columns:
                df['temperature'] = np.nan
            if 'line_num' in df.columns:
                df['line_num'] = df['line_num'].astype(str)
            
            # 혼잡도 순서 정렬
            congestion_order = ['매우여유', '여유', '보통', '혼잡', '매우혼잡']
            df['congestion_level'] = pd.Categorical(df['congestion_level'], categories=congestion_order, ordered=True)
            
            return df
        else:
            tried = '\n'.join(f'- {p}' for p in candidate_files)
            st.error("데이터 파일을 찾을 수 없습니다. 다음 위치를 확인해주세요:\n" + tried)
            return None
    except Exception as e:
        st.error(f"데이터 로드 중 오류가 발생했습니다: {e}")
        return None

def create_congestion_map(df_filtered):
    """혼잡도 지도 생성"""
    try:
        # 서울 중심 좌표
        seoul_center = [37.5665, 126.9780]
        
        # 지도 생성
        m = folium.Map(
            location=seoul_center,
            zoom_start=11,
            tiles='OpenStreetMap'
        )
        
        # 혼잡도별 색상
        color_map = {
            '매우여유': 'green',
            '여유': 'lightgreen', 
            '보통': 'yellow',
            '혼잡': 'orange',
            '매우혼잡': 'red'
        }
        
        # 역별 평균 혼잡도 계산
        station_stats = df_filtered.groupby('station_name').agg({
            'total_passengers': 'mean',
            'congestion_level': lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else '보통',
            'line_num': 'first'
        }).reset_index()
        
        # 각 역에 마커 추가
        for _, row in station_stats.iterrows():
            # 간단한 좌표 생성 (실제로는 역별 좌표 데이터가 필요)
            lat = seoul_center[0] + np.random.uniform(-0.1, 0.1)
            lon = seoul_center[1] + np.random.uniform(-0.1, 0.1)
            
            color = color_map.get(row['congestion_level'], 'gray')
            
            folium.CircleMarker(
                location=[lat, lon],
                radius=8,
                popup=f"""
                <b>{row['station_name']}역</b><br>
                호선: {row['line_num']}<br>
                혼잡도: {row['congestion_level']}<br>
                평균 승객: {row['total_passengers']:.0f}명
                """,
                color='black',
                weight=1,
                fillColor=color,
                fillOpacity=0.7
            ).add_to(m)
        
        return m
    except Exception as e:
        st.error(f"지도 생성 중 오류: {e}")
        return None

def main():
    """메인 함수"""
    # 헤더
    st.markdown('<h1 class="main-header">🚇 서울 지하철 혼잡도 대시보드</h1>', unsafe_allow_html=True)
    
    # 데이터 로드
    df = load_data()
    if df is None:
        return
    
    # 데이터 정보 표시
    st.markdown(f"""
    <div class="data-info">
        <h3>📊 데이터 정보</h3>
        <p><strong>총 데이터:</strong> {len(df):,}개 행</p>
        <p><strong>역 수:</strong> {df['station_name'].nunique()}개</p>
        <p><strong>날짜 범위:</strong> {df['date'].min().strftime('%Y-%m-%d')} ~ {df['date'].max().strftime('%Y-%m-%d')}</p>
        <p><strong>호선:</strong> {', '.join(sorted(df['line_num'].unique()))}</p>
    </div>
    """, unsafe_allow_html=True)
    
    # 사이드바 필터
    st.sidebar.header("🔍 필터 옵션")
    
    # 날짜 필터
    date_range = st.sidebar.date_input(
        "📅 날짜 범위",
        value=(df['date'].min().date(), df['date'].max().date()),
        min_value=df['date'].min().date(),
        max_value=df['date'].max().date()
    )
    
    # 호선 필터
    available_lines = sorted(df['line_num'].unique())
    selected_lines = st.sidebar.multiselect(
        "🚇 호선 선택",
        options=available_lines,
        default=available_lines
    )
    
    # 역 필터
    available_stations = sorted(df['station_name'].unique())
    selected_stations = st.sidebar.multiselect(
        "🚉 역 선택",
        options=available_stations,
        default=available_stations[:10] if len(available_stations) > 10 else available_stations
    )
    
    # 혼잡도 필터
    available_congestion = ['매우여유', '여유', '보통', '혼잡', '매우혼잡']
    selected_congestion = st.sidebar.multiselect(
        "🚦 혼잡도 선택",
        options=available_congestion,
        default=available_congestion
    )
    
    # 요일 필터
    available_weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    selected_weekdays = st.sidebar.multiselect(
        "📅 요일 선택",
        options=available_weekdays,
        default=available_weekdays
    )
    
    # 데이터 필터링
    df_filtered = df[
        (df['date'].dt.date >= date_range[0]) &
        (df['date'].dt.date <= date_range[1]) &
        (df['line_num'].isin(selected_lines)) &
        (df['station_name'].isin(selected_stations)) &
        (df['congestion_level'].isin(selected_congestion)) &
        (df['weekday'].isin(selected_weekdays))
    ].copy()
    
    if df_filtered.empty:
        st.warning("선택한 조건에 맞는 데이터가 없습니다.")
        return
    
    # 메인 대시보드
    st.header("📊 혼잡도 현황")
    
    # 주요 지표
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_passengers = df_filtered['total_passengers'].sum()
        st.metric("총 승객 수", f"{total_passengers:,}명")
    
    with col2:
        avg_passengers = df_filtered['total_passengers'].mean()
        st.metric("평균 승객 수", f"{avg_passengers:.0f}명")
    
    with col3:
        most_congested = df_filtered.groupby('station_name')['total_passengers'].mean().idxmax()
        st.metric("가장 혼잡한 역", most_congested)
    
    with col4:
        congestion_rate = (df_filtered['congestion_level'].isin(['혼잡', '매우혼잡']).sum() / len(df_filtered)) * 100
        st.metric("혼잡도 비율", f"{congestion_rate:.1f}%")
    
    # 탭 생성
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "📈 시간대별 분석", 
        "🌤️ 날씨 상관관계", 
        "🚇 호선별 비교", 
        "🗺️ 지도 시각화",
        "📋 상세 데이터"
    ])
    
    with tab1:
        st.header("📈 시간대별 혼잡도 분석")
        
        # 시간대별 평균 혼잡도
        hourly_congestion = df_filtered.groupby('hour')['total_passengers'].mean().reset_index()
        
        fig_hourly = px.line(
            hourly_congestion, 
            x='hour', 
            y='total_passengers',
            title='시간대별 평균 승객 수',
            labels={'hour': '시간', 'total_passengers': '평균 승객 수'}
        )
        fig_hourly.update_layout(height=400)
        st.plotly_chart(fig_hourly, use_container_width=True)
        
        # 요일별 혼잡도
        weekday_congestion = df_filtered.groupby('weekday')['total_passengers'].mean().reset_index()
        weekday_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekday_congestion['weekday'] = pd.Categorical(weekday_congestion['weekday'], categories=weekday_order, ordered=True)
        weekday_congestion = weekday_congestion.sort_values('weekday')
        
        fig_weekday = px.bar(
            weekday_congestion,
            x='weekday',
            y='total_passengers',
            title='요일별 평균 승객 수',
            labels={'weekday': '요일', 'total_passengers': '평균 승객 수'}
        )
        fig_weekday.update_layout(height=400)
        st.plotly_chart(fig_weekday, use_container_width=True)
    
    with tab2:
        st.header("🌤️ 날씨와 혼잡도 상관관계")
        
        # 날씨별 혼잡도
        weather_congestion = df_filtered.groupby('weather_condition')['total_passengers'].mean().reset_index()
        
        fig_weather = px.bar(
            weather_congestion,
            x='weather_condition',
            y='total_passengers',
            title='날씨별 평균 승객 수',
            labels={'weather_condition': '날씨', 'total_passengers': '평균 승객 수'}
        )
        fig_weather.update_layout(height=400)
        st.plotly_chart(fig_weather, use_container_width=True)
        
        # 온도와 승객 수 상관관계
        fig_temp = px.scatter(
            df_filtered.sample(min(1000, len(df_filtered))),
            x='temperature',
            y='total_passengers',
            color='congestion_level',
            title='온도와 승객 수 상관관계',
            labels={'temperature': '온도(°C)', 'total_passengers': '승객 수'}
        )
        fig_temp.update_layout(height=400)
        st.plotly_chart(fig_temp, use_container_width=True)
    
    with tab3:
        st.header("🚇 호선별 혼잡도 비교")
        
        # 호선별 평균 혼잡도
        line_congestion = df_filtered.groupby('line_num')['total_passengers'].mean().reset_index()
        
        fig_line = px.bar(
            line_congestion,
            x='line_num',
            y='total_passengers',
            title='호선별 평균 승객 수',
            labels={'line_num': '호선', 'total_passengers': '평균 승객 수'}
        )
        fig_line.update_layout(height=400)
        st.plotly_chart(fig_line, use_container_width=True)
        
        # 호선별 혼잡도 분포
        line_congestion_dist = df_filtered.groupby(['line_num', 'congestion_level']).size().reset_index(name='count')
        
        fig_line_dist = px.bar(
            line_congestion_dist,
            x='line_num',
            y='count',
            color='congestion_level',
            title='호선별 혼잡도 분포',
            labels={'line_num': '호선', 'count': '데이터 수'}
        )
        fig_line_dist.update_layout(height=400)
        st.plotly_chart(fig_line_dist, use_container_width=True)
    
    with tab4:
        st.header("🗺️ 지도 시각화")
        
        # 지도 생성
        congestion_map = create_congestion_map(df_filtered)
        
        if congestion_map:
            # 지도를 HTML로 변환하여 표시
            map_html = congestion_map._repr_html_()
            components.html(map_html, width=700, height=500)
        else:
            st.error("지도를 생성할 수 없습니다.")
        
        # 역별 상세 정보
        st.subheader("🚉 역별 상세 정보")
        station_details = df_filtered.groupby('station_name').agg({
            'total_passengers': ['mean', 'max', 'min'],
            'congestion_level': lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else '보통',
            'line_num': 'first'
        }).round(0)
        
        station_details.columns = ['평균 승객', '최대 승객', '최소 승객', '주요 혼잡도', '호선']
        station_details = station_details.sort_values('평균 승객', ascending=False)
        
        st.dataframe(station_details.head(20), use_container_width=True)
    
    with tab5:
        st.header("📋 상세 데이터")
        
        # 데이터 요약
        st.subheader("📊 데이터 요약")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.write("**혼잡도 분포:**")
            congestion_dist = df_filtered['congestion_level'].value_counts()
            for level, count in congestion_dist.items():
                st.write(f"- {level}: {count:,}개 ({count/len(df_filtered)*100:.1f}%)")
        
        with col2:
            st.write("**호선별 분포:**")
            line_dist = df_filtered['line_num'].value_counts()
            for line, count in line_dist.items():
                st.write(f"- {line}: {count:,}개")
        
        # 원본 데이터 표시
        st.subheader("📋 원본 데이터")
        st.dataframe(df_filtered, use_container_width=True)
        
        # 데이터 다운로드
        csv = df_filtered.to_csv(index=False, encoding='utf-8-sig')
        st.download_button(
            label="📥 데이터 다운로드 (CSV)",
            data=csv,
            file_name=f"seoul_subway_congestion_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv"
        )

if __name__ == "__main__":
    main()
