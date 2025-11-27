// AuthContext.js
import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
} from "react";

import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "./firebaseConfig";

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
      return { ...state, loading: false, error: action.message || "로그인 실패" };
    case "SIGNOUT":
      return { ...state, user: null, token: null, error: "" };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuth);

  // Firebase Auth 상태 감시
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch({
          type: "SIGNIN_SUCCESS",
          user: firebaseUser,
          token: firebaseUser.uid,
        });
      } else {
        dispatch({ type: "SIGNOUT" });
      }
    });
    return unsub;
  }, []);

  // 이메일/비번 로그인
  const signIn = async ({ email, password }) => {
    dispatch({ type: "SIGNIN_START" });
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged가 SIGNIN_SUCCESS를 처리함
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
    try {
      await fbSignOut(auth);
      dispatch({ type: "SIGNOUT" });
    } catch (e) {
      console.log("signOut error:", e);
    }
  };

  const value = useMemo(
    () => ({
      loading: state.loading,
      error: state.error,
      user: state.user,
      token: state.token,
      isAuthenticated: !!state.user,
      signIn,
      signOut,
    }),
    [state.loading, state.error, state.user, state.token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용해야 합니다.");
  }
  return ctx;
}
