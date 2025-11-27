// ChatScreen.js (src 폴더 안)

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

// Firebase 관련 함수들 import
import {
  db,
  auth,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "../firebaseConfig";     // ⬅️ ../ 로 수정

// AuthContext에서 로그인 상태 가져오기
import { useAuth } from "../AuthContext";  // ⬅️ ../ 로 수정

function ChatScreenApp() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // 🔥 이제 진짜 AuthContext에서 온 user / initializing
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      setMessages([]);
      return;
    }

    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(list);
    });

    return unsubscribe;
  }, [user, initializing]);

  const sendMessage = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !text.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: text.trim(),
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        userName: currentUser.email ?? "익명",
      });
      setText("");
    } catch (e) {
      console.log("sendMessage error:", e);
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.userId === auth.currentUser?.uid;
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        style={styles.list}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="메시지를 입력하세요"
        />
        <Button title="전송" onPress={sendMessage} />
      </View>

      <View style={{ marginBottom: 50 }} />
    </KeyboardAvoidingView>
  );
}

export default ChatScreenApp;

// 스타일은 교수님 코드 그대로
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    padding: 8,
  },
  messageContainer: {
    maxWidth: "70%",
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE",
  },
  userName: {
    fontSize: 10,
    marginBottom: 2,
    color: "#555",
  },
  messageText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
});
