const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');

const app = express();
const port = 3001;

// CORS 설정
app.use(cors());

// Multer 설정 (메모리 스토리지 사용)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  }
});

// 아카라이브 업로드 함수
const uploadToArca = async (fileBuffer, filename, mimetype) => {
  try {
    // 1단계: 아카라이브 에디터 페이지에서 토큰 가져오기
    const editorResponse = await fetch('https://arca.live/b/breaking/write', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    const editorHtml = await editorResponse.text();
    
    // CSRF 토큰 추출
    const csrfMatch = editorHtml.match(/name="csrfmiddlewaretoken"\s+value="([^"]+)"/);
    if (!csrfMatch) {
      throw new Error('CSRF 토큰을 찾을 수 없습니다');
    }
    const csrfToken = csrfMatch[1];

    // 세션 쿠키 추출
    const cookies = editorResponse.headers.get('set-cookie') || '';

    // 2단계: 이미지 업로드
    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', csrfToken);
    formData.append('upload', fileBuffer, {
      filename: filename,
      contentType: mimetype
    });

    const uploadResponse = await fetch('https://arca.live/api/image/', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://arca.live',
        'Referer': 'https://arca.live/b/breaking/write',
        'Cookie': cookies,
        'Connection': 'keep-alive'
      }
    });

    if (!uploadResponse.ok) {
      throw new Error(`아카라이브 업로드 실패: ${uploadResponse.status}`);
    }

    const result = await uploadResponse.json();
    
    if (result.url) {
      return {
        success: true,
        url: result.url
      };
    } else {
      throw new Error('업로드 응답에 URL이 없습니다');
    }

  } catch (error) {
    console.error('아카라이브 업로드 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 업로드 엔드포인트
app.post('/upload', upload.single('upload'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '업로드할 파일이 없습니다' });
    }

    // 이미지 파일인지 확인
    if (!req.file.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: '이미지 파일만 업로드할 수 있습니다' });
    }

    console.log('아카라이브 업로드 시작...', req.file.originalname);
    
    const uploadResult = await uploadToArca(
      req.file.buffer,
      req.file.originalname || 'image.jpg',
      req.file.mimetype
    );

    if (uploadResult.success) {
      console.log('업로드 성공:', uploadResult.url);
      res.json({
        url: uploadResult.url,
        message: '업로드 성공'
      });
    } else {
      console.error('업로드 실패:', uploadResult.error);
      res.status(500).json({
        error: uploadResult.error || '업로드 실패'
      });
    }

  } catch (error) {
    console.error('서버 오류:', error);
    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다'
    });
  }
});

// 서버 상태 확인 엔드포인트
app.get('/', (req, res) => {
  res.json({ 
    message: '아카라이브 업로드 프록시 서버가 실행 중입니다',
    status: 'running',
    endpoints: [
      'POST /upload - 이미지 업로드'
    ]
  });
});

app.listen(port, () => {
  console.log(`🚀 프록시 서버가 http://localhost:${port}에서 실행 중입니다`);
  console.log('📝 업로드 엔드포인트: POST /upload');
}); 