# 아카라이브 업로드 프록시 서버

## 🚀 무료 배포 가이드 (Vercel)

### 1단계: Vercel 계정 생성
1. [vercel.com](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. 무료 계정 생성

### 2단계: 프로젝트 배포
```bash
# 1. 이 폴더로 이동
cd proxy-server

# 2. 의존성 설치
npm install

# 3. Vercel CLI 로그인
npx vercel login

# 4. 프로젝트 배포
npx vercel --prod
```

### 3단계: 배포된 URL 확인
- 배포 완료 후 Vercel에서 제공하는 URL을 확인하세요
- 예시: `https://your-project-name.vercel.app`

### 4단계: 웹로그 생성기에 URL 설정
웹로그 생성기의 `.env` 파일에 배포된 URL을 설정:
```bash
REACT_APP_PROXY_URL=https://your-project-name.vercel.app
```

## 🔧 로컬 테스트

```bash
# 로컬 개발 서버 실행
npm run dev

# 테스트 URL: http://localhost:3000
```

## 📝 API 엔드포인트

- **POST** `/api/upload`
  - 파일 업로드 필드: `upload`
  - 최대 파일 크기: 10MB
  - 지원 형식: 이미지 파일만

## ⚠️ 주의사항

1. **무료 제한**: Vercel 무료 티어는 월 100GB 대역폭 제한
2. **실행 시간**: 서버리스 함수는 최대 30초 실행 시간
3. **보안**: 필요시 도메인 제한이나 인증을 추가하세요

## 🛠️ 트러블슈팅

### CORS 오류
- `vercel.json`에서 CORS 헤더가 설정되어 있습니다
- 브라우저 개발자 도구에서 네트워크 탭 확인

### 업로드 실패
- 아카라이브 API 변경 가능성
- 콘솔 로그에서 상세 오류 확인
- 파일 크기 및 형식 확인

### 배포 오류
```bash
# Vercel 로그 확인
npx vercel logs

# 재배포
npx vercel --prod --force
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Vercel 대시보드의 Functions 탭에서 로그 확인
2. 브라우저 개발자 도구의 Network 탭
3. 아카라이브 사이트 접속 가능 여부 