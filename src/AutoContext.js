// src/AuthContext.js
import React, { createContext, useContext, useMemo, useReducer } from "react";

/***********************
 * 더미 로그인 API (실서비스에서 교체)
 ***********************/
async function fakeSignIn({ email, password }) {
  await new Promise((r) => setTimeout(r, 600));
  if (!/.+@.+\..+/.test(String(email || "").trim()))
    throw new Error("올바른 이메일 형식이 아닙니다.");
  if (String(password || "").length < 6)
    throw new Error("비밀번호는 6자 이상이어야 합니다.");
  if (
    String(email).toLowerCase() !== "demo@example.com" ||
    password !== "pass123"
  )
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");

  return {
    token: "demo-token",
    user: { id: "u1", name: "Demo User", email: String(email).toLowerCase() },
  };
}

/***********************
 * Auth Context + Reducer
 ***********************/
const AuthContext = createContext(null);

const initialAuth = { loading: false, error: "", user: null, token: null };

function authReducer(state, action) {
  switch (action.type) {
    case "SIGNIN_START":
      return { ...state, loading: true, error: "" };
    case "SIGNIN_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.user,
        token: action.token,
        error: "",
      };
    case "SIGNIN_FAIL":
      return {
        ...state,
        loading: false,
        error: action.message || "로그인 실패",
      };
    case "SIGNOUT":
      return { ...state, user: null, token: null, error: "" };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuth);

  const signIn = async ({ email, password }) => {
    dispatch({ type: "SIGNIN_START" });
    try {
      const res = await fakeSignIn({ email, password });
      dispatch({ type: "SIGNIN_SUCCESS", user: res.user, token: res.token });
      return res;
    } catch (e) {
      dispatch({
        type: "SIGNIN_FAIL",
        message: e && e.message ? e.message : "로그인 실패",
      });
      throw e;
    }
  };

  const signOut = async () => {
    dispatch({ type: "SIGNOUT" });
  };

  const value = useMemo(
    () => ({
      loading: state.loading,
      error: state.error,
      user: state.user,
      token: state.token,
      isAuthenticated: !!state.token,
      signIn,
      signOut,
    }),
    [state.loading, state.error, state.user, state.token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용하세요");
  return ctx;
}
