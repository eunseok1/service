// App.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
} from "react-native";

import { AuthProvider, useAuth } from "./AuthContext";  // ✅ 여기
import EunHome from "./src/eunsuk";

/***********************
 * 로그인 화면 (Firebase 사용)
 ***********************/
function LoginScreen() {
  const { signIn, loading, error } = useAuth();

  const [email, setEmail] = useState("dhdmstjr100@naver.com");
  const [password, setPassword] = useState("jjud6455");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [secure, setSecure] = useState(true);

  const emailErr =
    touched.email && !/.+@.+\..+/.test(email)
      ? "올바른 이메일 형식이 아닙니다."
      : "";
  const passErr =
    touched.password && password.length < 6
      ? "비밀번호는 6자 이상이어야 합니다."
      : "";

  const canSubmit =
    /.+@.+\..+/.test(email) && password.length >= 6 && !loading;

  const submit = async () => {
    setTouched({ email: true, password: true });
    if (!canSubmit) return;
    try {
      await signIn({ email: email.trim(), password });
    } catch (e) {
      console.log("submit 에러:", e.code, e.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <View style={{ alignItems: "center" }}>
        <Image source={require("./kangnam.png")} style={styles.logo} />
      </View>

      <Text style={{ color: "#6b7280", fontSize: 12 }}>WELCOME BACK</Text>
      <Text
        style={{
          color: "#111827",
          fontSize: 26,
          fontWeight: "800",
          marginBottom: 16,
        }}
      >
        로그인
      </Text>

      <Text style={{ marginBottom: 6 }}>이메일</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        style={{
          height: 48,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: emailErr ? "#f59e0b" : "#d1d5db",
          paddingHorizontal: 12,
          marginBottom: 4,
        }}
      />
      {emailErr ? (
        <Text style={{ color: "#b45309", marginBottom: 8 }}>{emailErr}</Text>
      ) : null}

      <Text style={{ marginBottom: 6, marginTop: 8 }}>비밀번호</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: passErr ? "#f59e0b" : "#d1d5db",
          borderRadius: 10,
          height: 48,
          paddingHorizontal: 12,
          marginBottom: 4,
        }}
      >
        <TextInput
          value={password}
          onChangeText={setPassword}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          secureTextEntry={secure}
          placeholder="6자 이상 비밀번호"
          style={{ flex: 1 }}
        />
        <Pressable onPress={() => setSecure((s) => !s)} hitSlop={8}>
          <Text style={{ color: "#2563eb", fontWeight: "700" }}>
            {secure ? "보기" : "숨기기"}
          </Text>
        </Pressable>
      </View>
      {passErr ? (
        <Text style={{ color: "#b45309", marginBottom: 8 }}>{passErr}</Text>
      ) : null}

      {error ? (
        <Text
          style={{ color: "#dc2626", marginTop: 6, marginBottom: 8 }}
        >
          {error}
        </Text>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        style={{
          height: 48,
          borderRadius: 12,
          backgroundColor: canSubmit ? "#4f46e5" : "#9ca3af",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "700" }}>로그인</Text>
        )}
      </Pressable>
    </View>
  );
}

/***********************
 * Router: 인증 여부에 따른 화면 전환
 ***********************/
function Router() {
  const { isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  return <EunHome onLogout={signOut} />;
}

/***********************
 * 엔트리
 ***********************/
export default function App() {
  return (a
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AuthProvider>
          <Router />
        </AuthProvider>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 100,
    marginTop: -50,
  },
});
