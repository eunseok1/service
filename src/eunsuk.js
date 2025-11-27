// ⚠️ 반드시 최상단
import 'react-native-gesture-handler';
import React from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WeatherScreen from './whether';   // ✅ 날씨 화면
import ScheduleScreen from './schedule'; // ✅ Firebase 연동 “할 일” 화면
import ChatScreenApp from './firechat';
/** ========== 기본 화면들 ========== */
function ProfileScreen({ navigation }) {
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
      }}
    >
      <Image source={require('./apple.png')} style={styles.logo} />
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 150 }}>👤 프로필</Text>
      <Text style={{ textAlign: 'center' }}>
        이름: 오은석{'\n'}
        강남대학교 인공지능 학부 {'\n'}
        배운 내용: 강화학습 · 소프트웨어 · 컴퓨터공학
      </Text>
      <Button title="연락처로 이동" onPress={() => navigation.navigate('ContactTab')} />
    </ScrollView>
  );
}

/** ✅ 포트폴리오 리스트 */
function PortfolioList({ navigation }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>📁 포트폴리오</Text>

      <Image
        source={require('./pot.png')}
        style={{ width: '100%', height: 200, borderRadius: 10 }}
        resizeMode="cover"
      />

      <Button
        title="프로젝트 A 상세"
        onPress={() => navigation.navigate('ProjectDetail', { id: 'A' })}
      />
      <Button
        title="프로젝트 B 상세"
        onPress={() => navigation.navigate('ProjectDetail', { id: 'B' })}
      />
      <Button
        title="프로젝트 C 상세"
        onPress={() => navigation.navigate('ProjectDetail', { id: 'C' })}
      />
    </ScrollView>
  );
}

/** ✅ 프로젝트 상세 (A: 음식 / B: 게임 / C: AI) */
function ProjectDetail({ route, navigation }) {
  const { id } = route.params ?? {};

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        {id === 'A'
          ? '🍣 일본 음식'
          : id === 'B'
          ? '🎮 게임'
          : id === 'C'
          ? '🤖 AI'
          : `프로젝트 상세: ${id}`}
      </Text>

      <Text>- 소개</Text>

      {/* 🍜 일본 음식 */}
      {id === 'A' && (
        <View style={styles.imageGroup}>
          <Image source={require('./food1.png')} style={styles.projectImg} />
          <Text style={styles.desc}>따뜻한 국물과 쫄깃한 면이 어우러진 일본식 라멘입니다.</Text>

          <Image source={require('./food2.png')} style={styles.projectImg} />
          <Text style={styles.desc}>신선한 생선과 밥의 조화가 매력적인 초밥입니다.</Text>

          <Image source={require('./food3.png')} style={styles.projectImg} />
          <Text style={styles.desc}>
            바삭한 튀김옷 속 부드러운 고기가 특징인 일본식 돈까스입니다.
          </Text>
        </View>
      )}

      {/* 🎮 게임 */}
      {id === 'B' && (
        <View style={styles.imageGroup}>
          <Image source={require('./game1.png')} style={styles.projectImg} />
          <Text style={styles.desc}>롤은 팀 전략과 챔피언 조합이 중요한 MOBA 게임입니다.</Text>

          <Image source={require('./game2.png')} style={styles.projectImg} />
          <Text style={styles.desc}>
            발로란트는 에임과 스킬 조합이 핵심인 전술 FPS 게임입니다.
          </Text>

          <Image source={require('./game3.png')} style={styles.projectImg} />
          <Text style={styles.desc}>
            배틀그라운드는 전략과 에임이 중요한 핵심 전략 FPS 게임입니다.
          </Text>
        </View>
      )}

      {/* 🤖 AI */}
      {id === 'C' && (
        <View style={styles.imageGroup}>
          <Image source={require('./ai1.png')} style={styles.projectImg} />
          <Text style={styles.desc}>
            챗지피티는 대화형 생성 AI로 질문 답변과 글쓰기 보조에 강점을 가집니다.
          </Text>

          <Image source={require('./ai2.png')} style={styles.projectImg} />
          <Text style={styles.desc}>
            제미나이는 멀티모달 이해와 검색 결합에 특화된 생성형 모델입니다.
          </Text>

          <Image source={require('./ai3.png')} style={styles.projectImg} />
          <Text style={styles.desc}>코파일럿은 사용자에 특화된 학습 기법을 가진 Ai입니다.</Text>
        </View>
      )}

      <Button title="뒤로" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

function ContactScreen() {
  return (
    <View style={{ flex: 1, padding: 24, gap: 12, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>📫 연락처</Text>
      <Text>이메일: dsad125@naver.com</Text>
      <Text>GitHub: github.orcave.com</Text>
      <Text>전화번호: 010-2342-2421</Text>
    </View>
  );
}

/** ✅ 블로그 화면 */
function BlogScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>✍️ 블로그</Text>
      <Image
        source={require('./1.png')}
        style={{ width: '100%', height: 200, borderRadius: 10, marginBottom: 10 }}
        resizeMode="cover"
      />
      <Text>- AI시대의 돌입</Text>
      <Text>- 코드 작성법</Text>
      <Text>- RNN vs CNN</Text>
    </ScrollView>
  );
}

/** ========== 네비게이터 구성 ========== */
const PortfolioStackNav = createNativeStackNavigator();
function PortfolioStack() {
  return (
    <PortfolioStackNav.Navigator
      screenOptions={{ headerTitleAlign: 'center', headerShown: false }}
    >
      <PortfolioStackNav.Screen
        name="PortfolioList"
        component={PortfolioList}
        options={{ title: '포트폴리오' }}
      />
      <PortfolioStackNav.Screen
        name="ProjectDetail"
        component={ProjectDetail}
        options={{ title: '프로젝트 상세' }}
      />
    </PortfolioStackNav.Navigator>
  );
}

// 하단 탭 (홈(탭) 안에서만 사용)
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: '프로필',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/button_b.png')
                  : require('../assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="PortfolioTab"
        component={PortfolioStack}
        options={{
          title: '포트폴리오',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/button_b.png')
                  : require('../assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="BlogTab"
        component={BlogScreen}
        options={{
          title: '블로그',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/button_b.png')
                  : require('../assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ContactTab"
        component={ContactScreen}
        options={{
          title: '연락처',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/button_b.png')
                  : require('../assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />

      {/* 🔹 할 일 탭 (Firebase Sample 화면) */}
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleScreen}
        options={{
          title: '할 일',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/button_b.png')
                  : require('../assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />

      {/* 🔹 날씨 탭 */}
      <Tab.Screen
        name="WeatherTab"
        component={WeatherScreen}
        options={{
          title: '날씨',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/button_b.png')
                  : require('../assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// 드로어용 소개 화면
function AboutScreen() {
  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>ℹ️ 사이트 소개</Text>
      <Text>개인 포트폴리오 · 블로그 · 연락처를 한 곳에</Text>
    </View>
  );
}

/** 🔹 로그아웃 전용 화면 */
function LogoutScreen({ onLogout }) {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>로그아웃 하시겠습니까?</Text>
      <Button title="로그아웃" onPress={onLogout} />
    </View>
  );
}

const Drawer = createDrawerNavigator();

/** 🔹 EunHome: Drawer(홈(탭) + 일정관리 + 소개 + 로그아웃) */
export default function EunHome({ onLogout }) {
  return (
    <NavigationContainer independent={true}>
      <Drawer.Navigator>
        <Drawer.Screen
          name="Home"
          component={MainTabs}
          options={{ title: '홈(탭)' }}
        />
        {/* 드로어에서도 바로 일정 관리로 이동하고 싶으면 유지 */}
        <Drawer.Screen
          name="Schedule"
          component={ScheduleScreen}
          options={{ title: '일정관리' }}
        />
        
        {/* 🔥 여기 채팅 메뉴 추가 */}
        <Drawer.Screen
          name="Chat"
          component={ChatScreenApp}
          options={{ title: '채팅' }}
        />
        <Drawer.Screen name="About" component={AboutScreen} options={{ title: '소개' }} />
        <Drawer.Screen name="Logout" options={{ title: '로그아웃' }}>
          {(props) => <LogoutScreen {...props} onLogout={onLogout} />}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 10,
    marginTop: 100,
  },
  imageGroup: {
    marginTop: 10,
    gap: 16,
  },
  projectImg: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  desc: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
});
