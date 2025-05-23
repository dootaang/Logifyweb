const FormData = require('form-data');
const Busboy = require('busboy');

// 아카라이브 업로드 함수
const uploadToArca = async (fileBuffer, filename, mimetype) => {
  try {
    // 동적 import를 사용하여 node-fetch 불러오기
    const fetch = (await import('node-fetch')).default;
    
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

// multipart 데이터 파싱 함수
const parseMultipart = (event) => {
  return new Promise((resolve, reject) => {
    const contentType = event.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      reject(new Error('Content-Type이 multipart/form-data가 아닙니다'));
      return;
    }

    const body = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    const busboy = Busboy({ headers: { 'content-type': contentType } });
    
    let fileBuffer = null;
    let filename = 'image.jpg';
    let mimetype = 'image/jpeg';

    busboy.on('file', (fieldname, file, info) => {
      if (fieldname === 'upload') {
        filename = info.filename || 'image.jpg';
        mimetype = info.mimeType || 'image/jpeg';
        
        const chunks = [];
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      }
    });

    busboy.on('finish', () => {
      resolve({ fileBuffer, filename, mimetype });
    });

    busboy.on('error', (err) => {
      reject(err);
    });

    busboy.write(body);
    busboy.end();
  });
};

// Netlify Functions 핸들러
exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'POST 메서드만 허용됩니다' }),
    };
  }

  try {
    // multipart/form-data 파싱
    const { fileBuffer, filename, mimetype } = await parseMultipart(event);

    if (!fileBuffer) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '업로드할 파일이 없습니다' }),
      };
    }

    // 이미지 파일인지 확인
    if (!mimetype.startsWith('image/')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '이미지 파일만 업로드할 수 있습니다' }),
      };
    }

    console.log('아카라이브 업로드 시작...', filename);
    
    const uploadResult = await uploadToArca(fileBuffer, filename, mimetype);

    if (uploadResult.success) {
      console.log('업로드 성공:', uploadResult.url);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          url: uploadResult.url,
          message: '업로드 성공'
        }),
      };
    } else {
      console.error('업로드 실패:', uploadResult.error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: uploadResult.error || '업로드 실패'
        }),
      };
    }

  } catch (error) {
    console.error('서버 오류:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '서버 내부 오류가 발생했습니다'
      }),
    };
  }
}; 