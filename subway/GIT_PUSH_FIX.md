# Git Push 오류 해결 방법

## 오류 원인
원격 저장소(GitHub)에 이미 커밋이 있어서 로컬과 충돌이 발생했습니다.

## 해결 방법 (단계별)

### 방법 1: 원격 변경사항 가져오기 (안전한 방법) ⭐ 추천

```bash
cd subway

# 1. 현재 변경사항 커밋
git add .
git commit -m "Update code and add deployment guides"

# 2. 원격 저장소의 변경사항 가져오기
git pull origin main --allow-unrelated-histories

# 3. 충돌이 있으면 해결 후
git add .
git commit -m "Merge remote changes"

# 4. 다시 push
git push origin main
```

### 방법 2: 강제 push (주의! 원격 내용 덮어씀)

**⚠️ 주의: 이 방법은 원격 저장소의 모든 내용을 덮어씁니다!**

```bash
cd subway

# 변경사항 커밋
git add .
git commit -m "Update code"

# 강제 push (원격 내용 덮어쓰기)
git push origin main --force
```

**이 방법은 원격에 중요한 코드가 없을 때만 사용하세요!**

### 방법 3: 원격 저장소 확인 후 결정

```bash
# 원격 저장소에 무엇이 있는지 확인
git fetch origin
git log origin/main

# 원격에 중요한 내용이 없으면 방법 2 사용
# 중요한 내용이 있으면 방법 1 사용
```

