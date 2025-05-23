# 웹로그 생성기

아카라이브용 커스터마이징 가능한 웹로그를 생성하는 도구입니다.

## ✨ 주요 기능

- 🎨 **커스터마이징**: 배경 이미지, 텍스트, 색상 자유롭게 변경
- 🚀 **아카라이브 연동**: 직접 이미지 업로드 및 HTML 변환
- 👀 **실시간 미리보기**: 변경사항을 즉시 확인
- 📋 **HTML 코드 생성**: 아카라이브에 바로 붙여넣기 가능
- 🔄 **자동 형식 변환**: 대화 부분 자동 스타일링

## 🚀 빠른 시작

### 1단계: 프록시 서버 배포 (필수)

아카라이브 업로드를 위해 프록시 서버를 먼저 배포해야 합니다.

```bash
# proxy-server 폴더로 이동
cd proxy-server

# 의존성 설치
npm install

# Vercel에 배포
npx vercel login
npx vercel --prod
```

자세한 배포 가이드는 [proxy-server/README.md](proxy-server/README.md)를 참고하세요.

### 2단계: 웹 앱 설정

```bash
# 메인 프로젝트 의존성 설치
npm install

# 환경변수 설정
cp env.example .env
# .env 파일에서 REACT_APP_PROXY_URL을 배포된 Vercel URL로 변경

# 개발 서버 실행
npm run dev
```

## 🔧 환경변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 1단계에서 배포한 Vercel URL 입력
REACT_APP_PROXY_URL=https://your-project-name.vercel.app
```

## 📖 사용 방법

### 1. 배경 이미지 설정
- **파일 업로드**: "아카라이브에 업로드" 버튼으로 직접 업로드
- **URL 입력**: 이미지 URL 직접 입력
- **HTML 붙여넣기**: 아카라이브 이미지 HTML 태그 자동 인식

### 2. 텍스트 박스 커스터마이징
- 왼쪽/오른쪽 텍스트 내용 변경
- 왼쪽 박스 그라데이션 색상 선택

### 3. 본문 작성
- 일반 텍스트는 그대로 입력
- 대화는 따옴표("...")로 감싸면 자동 스타일링

### 4. HTML 코드 생성
- "HTML 코드 복사" 버튼으로 클립보드에 복사
- 아카라이브 게시글에 직접 붙여넣기

## 🛠️ 개발 환경 설정

```bash
# 프로젝트 클론
git clone [repository-url]
cd weblogen

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 📁 프로젝트 구조

```
weblogen/
├── src/
│   ├── App.jsx          # 메인 앱 컴포넌트
│   ├── App.css          # 스타일시트
│   └── main.jsx         # 앱 진입점
├── proxy-server/        # 아카라이브 업로드 프록시 서버
│   ├── api/upload.js    # 업로드 API
│   ├── package.json     # 서버 의존성
│   ├── vercel.json      # Vercel 배포 설정
│   └── README.md        # 서버 배포 가이드
├── package.json         # 웹 앱 의존성
├── env.example          # 환경변수 예시
└── README.md           # 이 파일
```

## 🎯 핵심 기능 상세

### 이미지 업로드
- 아카라이브 서버에 직접 업로드
- CORS 및 CSRF 보안 우회
- 자동 URL 변환 및 HTML 형식 생성

### 자동 스타일링
- 대화 부분: 파란색 그라데이션
- 본문: 회색 텍스트
- 단락 구분: 자동 줄바꿈

### 반응형 디자인
- 모바일/데스크톱 호환
- 다양한 화면 크기 지원

## ⚠️ 주의사항

1. **프록시 서버 필수**: 아카라이브 업로드를 위해 프록시 서버 배포가 필요합니다
2. **무료 제한**: Vercel 무료 티어는 월 100GB 대역폭 제한
3. **이미지 크기**: 최대 10MB 이미지만 업로드 가능
4. **아카라이브 정책**: 아카라이브 이용약관을 준수하여 사용하세요

## 🔗 배포 링크

- **Vercel**: 프록시 서버 배포용
- **Netlify**: 웹 앱 배포 대안
- **GitHub Pages**: 정적 사이트 배포 (프록시 서버 제외)

## 📞 지원 및 문의

문제가 발생하면:
1. [Issues](링크) 탭에서 기존 문제 확인
2. 브라우저 개발자 도구에서 오류 로그 확인
3. Vercel 대시보드에서 함수 로그 확인

## 📄 라이선스

MIT License - 자유롭게 사용하고 수정하세요! 