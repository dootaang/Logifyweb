const formidable = require('formidable');
const FormData = require('form-data');
const fetch = require('node-fetch');

// CORS 헤더 설정
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

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

// 메인 핸들러 함수
export default async function handler(req, res) {
  setCorsHeaders(res);

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 메서드만 허용됩니다' });
  }

  try {
    // formidable로 파일 파싱
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB 제한
      keepExtensions: true
    });

    const [fields, files] = await form.parse(req);
    
    const uploadFile = files.upload?.[0];
    if (!uploadFile) {
      return res.status(400).json({ error: '업로드할 파일이 없습니다' });
    }

    // 이미지 파일인지 확인
    if (!uploadFile.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: '이미지 파일만 업로드할 수 있습니다' });
    }

    // 파일 읽기
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(uploadFile.filepath);

    // 아카라이브에 업로드
    console.log('아카라이브 업로드 시작...', uploadFile.originalFilename);
    const uploadResult = await uploadToArca(
      fileBuffer, 
      uploadFile.originalFilename || 'image.jpg',
      uploadFile.mimetype
    );

    if (uploadResult.success) {
      console.log('업로드 성공:', uploadResult.url);
      res.status(200).json({
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
} 