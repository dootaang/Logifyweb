import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [config, setConfig] = useState({
    backgroundImage: 'https://ac-p1.namu.la/20250523sac/6cdb6caae9c7cb41027c79b7fd28f28eca74d99432eb9bf21bd851c32d3b6efc.png?expires=1748022386&key=IegxDupGvczNLCp-ws99pg',
    leftText: '얼헌',
    rightText: '잼이오',
    leftTextColor1: '#4B69A0',
    leftTextColor2: '#89D9D8',
    content: `서울 헌터 협회 중앙 로비는 낮고 끊임없는 활동 소음으로 웅성거렸다. 한쪽 벽에는 세련된 단말기들이 줄지어 있었고, 대부분의 행인들은 다른 곳에 집중하느라 무시하는, 변동하는 게이트 정보를 표시하고 있었다. 긴장과 기대가 뒤섞인 표정으로 알아볼 수 있는 신규 각성자들은 간단한 서류 양식을 꽉 쥐고, 때때로 보안 복도 아래로 보이는 위압적인 등급 평가실 쪽을 힐끗거렸다. 제복을 입은 협회 직원들은 숙련된 효율성으로 움직였고, 그들의 발걸음은 광택 나는 바닥에 부드럽게 울려 퍼졌다. 에어컨은 넓은 공간을 시원하게 유지했고, 이는 바깥의 습한 여름 공기와 대조를 이루었다.

당신은 등록 및 초기 측정라고 표시된 접수처 앞에 섰다. 그 뒤에는 최유진이 단정한 협회 유니폼을 입고 흠잡을 데 없는 자세로 앉아 있었다. 그녀의 검은 단발머리는 그녀가 지닌 권위에 비해 놀라울 정도로 젊으면서도 전문가적인 얼굴을 감싸고 있었다. 블레이저에 달린 코팅된 ID 배지는 그녀의 이름과 직책(등록 및 평가 팀장)을 확인시켜 주었다.

그녀가 단말기에서 고개를 들자, 그녀의 시선이 당신과 정면으로 마주쳤다. 거기에는 어떤 판단도 없이, 그저 차분하고 전문적인 평가만이 담겨 있었다. 그녀는 약간의 연습된 미소를 지어 보였다.

"헌터 협회에 오신 것을 환영합니다." 최유진이 배경 소음을 쉽게 뚫고 나가는 명료하고 또렷한 목소리로 말문을 열었다. "각성을 축하드립니다. 공식 등급 측정을 진행하기 전에, 헌터 프로필에 기록해야 할 몇 가지 필수 세부 정보가 있습니다. 이는 모든 신규 등록자에게 적용되는 표준 절차입니다."

그녀는 책상 표면에 통합된 세련된 태블릿을 가리켰다. "성함과 연령, 성별을 말씀해 주시겠습니까? 또한, 대략적인 각성 날짜와 시간을 기억하신다면 도움이 될 것입니다. 마지막으로, 현재 보유하고 계신 것으로 파악된 스킬이 있다면 모두 말씀해 주십시오."

최유진은 정보를 입력할 준비를 하며 태블릿 위를 펜으로 가볍게 두드렸다. 그녀는 전문가적인 태도를 잃지 않고 참을성 있게 기다리며, 당신이 생각을 정리하고 헌터로서의 새로운 삶의 첫 공식 단계에 응답할 시간을 주었다.`
  });

  const [imageError, setImageError] = useState(false);
  const [extractedFromHtml, setExtractedFromHtml] = useState(false);
  const [previewImageLoaded, setPreviewImageLoaded] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 프록시 URL 설정 (환경변수 또는 기본값)
  const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001'; // 환경변수에서 읽어오거나 로컬 서버 사용
  
  // Netlify Functions 사용 여부 확인
  const isNetlifyDeploy = import.meta.env.VITE_USE_NETLIFY === 'true' || window.location.hostname.includes('netlify');
  const API_ENDPOINT = isNetlifyDeploy ? '/.netlify/functions/upload' : `${PROXY_URL}/upload`;

  // 아카라이브 업로드 함수
  const uploadImageToArca = async (file) => {
    try {
      // 먼저 프록시 서버가 실행 중인지 확인 (Netlify가 아닌 경우만)
      if (!isNetlifyDeploy) {
        try {
          const healthCheck = await fetch(PROXY_URL, { method: 'GET' });
          if (!healthCheck.ok) {
            throw new Error('프록시 서버에 연결할 수 없습니다');
          }
        } catch (error) {
          throw new Error(`프록시 서버 연결 실패: ${PROXY_URL}\n로컬 서버가 실행되고 있는지 확인하세요`);
        }
      }

      // FormData 생성
      const formData = new FormData();
      formData.append("upload", file);

      // fetch 요청
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`업로드 실패 (${response.status}): ${errorData}`);
      }

      const data = await response.json();

      return {
        status: true,
        url: data.url,
      };
    } catch (error) {
      console.error("Upload error:", error);

      return {
        status: false,
        error: error instanceof Error 
          ? error.message 
          : "알 수 없는 오류가 발생했습니다.",
      };
    }
  };

  // 아카라이브 HTML 형식으로 변환
  const formatAsArcaHtml = (url) => {
    return `<p><img src="${url}" class="fr-fic fr-dii"></p>`;
  };

  // 아카라이브 이미지 HTML에서 URL 추출하는 함수
  const extractImageUrlFromHtml = (htmlString) => {
    // 문자열에서 img 태그의 src 속성을 추출
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
    const match = htmlString.match(imgTagRegex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    // 만약 img 태그가 없다면 원본 문자열이 URL인지 확인
    return htmlString;
  };

  // 입력값이 HTML인지 확인하는 함수
  const isHtmlImageTag = (input) => {
    return input.includes('<img') && input.includes('src=');
  };

  const handleInputChange = (field, value) => {
    let finalValue = value;
    let isFromHtml = false;

    // 배경 이미지 필드이고 HTML 형태인 경우 URL 추출
    if (field === 'backgroundImage' && isHtmlImageTag(value)) {
      finalValue = extractImageUrlFromHtml(value);
      isFromHtml = true;
    }

    setConfig(prev => ({
      ...prev,
      [field]: finalValue
    }));
    
    // 배경 이미지가 변경될 때 에러 상태 초기화
    if (field === 'backgroundImage') {
      setImageError(false);
      setExtractedFromHtml(isFromHtml);
      setPreviewImageLoaded(false);
    }
  };

  // URL에 프로토콜이 없으면 https를 추가하는 함수
  const normalizeImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      return 'https://' + url;
    }
    return url;
  };

  // 이미지 프록시 URL 생성 함수 (항상 사용)
  const getProxyImageUrl = (url) => {
    const normalizedUrl = normalizeImageUrl(url);
    return `https://images.weserv.nl/?url=${encodeURIComponent(normalizedUrl)}`;
  };

  // 미리보기용 이미지 URL 생성 함수 (항상 프록시 사용)
  const getPreviewImageUrl = (url) => {
    return getProxyImageUrl(url);
  };

  // 이미지 로딩 테스트 함수
  const testImageLoad = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = normalizeImageUrl(url);
    });
  };

  // 클립보드에서 이미지 HTML 붙여넣기 처리
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (isHtmlImageTag(pastedText)) {
      e.preventDefault();
      const extractedUrl = extractImageUrlFromHtml(pastedText);
      handleInputChange('backgroundImage', extractedUrl);
      setExtractedFromHtml(true);
    }
  };

  // 파일 업로드 처리 함수 (아카라이브 업로드)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('아카라이브에 업로드 중...');

    try {
      const result = await uploadImageToArca(file);

      if (result.status && result.url) {
        // 성공적으로 업로드된 경우
        handleInputChange('backgroundImage', result.url);
        setUploadStatus('✅ 아카라이브 업로드 완료!');
        
        // 아카라이브 HTML 형식으로 변환된 것을 보여주기
        const arcaHtml = formatAsArcaHtml(result.url);
        console.log('생성된 아카라이브 HTML:', arcaHtml);
        
        setTimeout(() => setUploadStatus(''), 5000);
      } else {
        // 업로드 실패
        setUploadStatus(`❌ 업로드 실패: ${result.error || '알 수 없는 오류'}`);
        setTimeout(() => setUploadStatus(''), 5000);
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      setUploadStatus('❌ 업로드 중 오류가 발생했습니다.');
      setTimeout(() => setUploadStatus(''), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  // 미리보기 이미지 로딩 상태 확인
  useEffect(() => {
    if (config.backgroundImage) {
      setPreviewImageLoaded(true);
    }
  }, [config.backgroundImage]);

  const generateHTML = () => {
    const paragraphs = config.content.split('\n\n').filter(p => p.trim());
    
    const contentHTML = paragraphs.map(paragraph => {
      const trimmedParagraph = paragraph.trim();
      
      if (trimmedParagraph.includes('"') && trimmedParagraph.includes('"')) {
        // 대화 부분을 찾아서 스타일 적용
        const beforeQuote = trimmedParagraph.split('"')[0];
        const quote = trimmedParagraph.split('"')[1];
        const afterQuote = trimmedParagraph.split('"')[2] || '';
        
        return `
    <p><span style="color: #494949;">${beforeQuote}</span><span style="font-weight:500;background:linear-gradient(to right,#2A4569,#497AA6);background-clip:text;color:transparent;box-decoration-break:clone;">"${quote}"</span><span style="color: #494949;">${afterQuote}</span></p>

    <p>
      <br>
    </p>`;
      } else {
        return `
    <p><span style="color: #494949;">${trimmedParagraph}</span></p>

    <p>
      <br>
    </p>`;
      }
    }).join('');

    const finalImageUrl = normalizeImageUrl(config.backgroundImage);

    return `<p>
	<br>
</p>
<div style="border:solid 0px #e3e3e3;background-color:rgba(250, 250, 250, 1);border-radius:20px;position:relative;width:100%;max-width:700px;margin:0px auto;">
	<div style="height: 85px;margin:-1px -1px 0px -1px;">
		<div style="background-image:url('${finalImageUrl}');background-size:cover;height:170px;background-position:50% 40%;border-radius:19px 19px 0px 0px;background-color:#f0f0f0;">
			<div style="height:130px;width:100%;border-radius:19px 19px 0px 0px;">
				<br>
			</div></div></div>
	<div style="background:linear-gradient(135deg,rgba(${hexToRgb(config.leftTextColor1)}),rgba(${hexToRgb(config.leftTextColor2)}));background-size:110%;background-position:center;border-radius:10px;padding:10px;line-height:10px;text-transform:uppercase;letter-spacing:0.1em;box-shadow: 0px 0px 0px 3px rgba(233,233,233,0.9), inset 0px 40px 0px rgba(30,30,30,.1);display:flex;width:fit-content;max-width:300px;float:left;margin-left:6.5%;margin-top:70px;"><span style="text-decoration:none;color:#ededed;font-weight:600;text-shadow:0px 0px 5px rgba(30,30,30,.1);">${config.leftText}</span></div>
	<div style="margin-top: 70px;float: right;width: fit-content; max-width: 100%; background-color:#494949;border-radius:5px 0px 0px 5px;padding:10px;line-height:10px;letter-spacing:0.25em;text-transform:uppercase;color:#d5d5d5;font-size:0.7em;">${config.rightText}</div>
	<div style="padding:20px 7%;line-height:22px;letter-spacing:.35px;margin-top: 90px;">

		<p style="line-height:2;margin:2rem 0;font-size:13.8px;letter-spacing:-0.8px;">
			<br>
		</p>
${contentHTML}
	</div></div>`;
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, 1`
      : '0, 0, 0, 1';
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateHTML()).then(() => {
      alert('HTML 코드가 클립보드에 복사되었습니다!');
    });
  };

  // 이미지 URL 테스트 버튼 핸들러
  const testImage = async () => {
    const isValid = await testImageLoad(config.backgroundImage);
    if (isValid) {
      alert('이미지를 성공적으로 로드할 수 있습니다!');
      setImageError(false);
    } else {
      alert('이미지를 로드할 수 없습니다. URL을 확인해주세요.');
      setImageError(true);
    }
  };

  return (
    <div className="container">
      <h1>웹로그 생성기</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="editor-panel">
          <h2>설정</h2>
          
          <div className="form-group">
            <label>배경 이미지</label>
            
            {/* 아카라이브 이미지 업로드 버튼 */}
            <div style={{ marginBottom: '10px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="imageUpload"
                disabled={isUploading}
              />
              <label 
                htmlFor="imageUpload"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: isUploading 
                    ? 'linear-gradient(135deg, #95a5a6, #7f8c8d)' 
                    : 'linear-gradient(135deg, #e74c3c, #c0392b)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => !isUploading && (e.target.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => !isUploading && (e.target.style.transform = 'translateY(0)')}
              >
                {isUploading ? '🔄 업로드 중...' : '🚀 아카라이브에 업로드'}
              </label>
              {uploadStatus && (
                <div style={{ 
                  marginLeft: '10px', 
                  color: uploadStatus.includes('완료') ? '#27ae60' : uploadStatus.includes('실패') || uploadStatus.includes('❌') ? '#e74c3c' : '#f39c12',
                  fontSize: '12px',
                  display: 'inline-block'
                }}>
                  {uploadStatus}
                </div>
              )}
            </div>

            {/* URL 입력 */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={config.backgroundImage}
                onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                onPaste={handlePaste}
                placeholder="또는 이미지 URL / 아카라이브 이미지 HTML을 입력하세요"
                style={{ 
                  borderColor: imageError ? '#e74c3c' : extractedFromHtml ? '#27ae60' : '#e1e1e1',
                  flex: 1
                }}
              />
              <button 
                onClick={testImage}
                style={{
                  padding: '8px 15px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                테스트
              </button>
            </div>
            
            {imageError && (
              <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>
                ⚠️ 이미지를 로드할 수 없습니다. URL을 확인해주세요.
              </div>
            )}
            
            {extractedFromHtml && (
              <div style={{ color: '#27ae60', fontSize: '12px', marginTop: '5px' }}>
                ✅ 아카라이브 이미지 HTML에서 URL을 자동으로 추출했습니다!
              </div>
            )}
            
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              💡 팁: 
              <br />• "아카라이브에 업로드" 버튼으로 직접 아카라이브에 업로드할 수 있습니다
              <br />• 업로드된 이미지는 아카라이브 형식의 HTML로 자동 변환됩니다
              <br />• 아카라이브 이미지 HTML도 자동으로 인식됩니다
            </div>
            
            {/* 프록시 서버 설정 안내 */}
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              background: isNetlifyDeploy ? '#d1ecf1' : '#fff3cd', 
              borderRadius: '8px', 
              fontSize: '12px', 
              color: isNetlifyDeploy ? '#0c5460' : '#856404',
              border: isNetlifyDeploy ? '1px solid #bee5eb' : '1px solid #ffeaa7'
            }}>
              <strong>{isNetlifyDeploy ? '🌐 Netlify Functions' : '⚙️ 프록시 서버 설정'}:</strong>
              <br />현재 API 엔드포인트: <code>{API_ENDPOINT}</code>
              <br />
              {isNetlifyDeploy ? (
                <>
                  <br />✅ Netlify Functions를 사용 중입니다!
                  <br />별도 서버 설정이 필요하지 않습니다.
                </>
              ) : (
                <>
                  <br />📋 <strong>해결 방법:</strong>
                  <br />1. proxy-server 폴더에서 <code>node simple-server.js</code> 실행
                  <br />2. 또는 <code>npm run dev</code>로 Vercel 개발 서버 실행
                  <br />3. 서버가 실행되면 <code>http://localhost:3001</code>에서 접근 가능
                  <br />
                  <br />🌐 <strong>또는 Netlify에 배포하세요:</strong>
                  <br />• Netlify에 배포하면 자동으로 Functions를 사용합니다
                </>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>왼쪽 텍스트</label>
              <input
                type="text"
                value={config.leftText}
                onChange={(e) => handleInputChange('leftText', e.target.value)}
                placeholder="왼쪽 텍스트를 입력하세요"
              />
            </div>
            <div className="form-group">
              <label>오른쪽 텍스트</label>
              <input
                type="text"
                value={config.rightText}
                onChange={(e) => handleInputChange('rightText', e.target.value)}
                placeholder="오른쪽 텍스트를 입력하세요"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>왼쪽 박스 색상 1</label>
              <input
                type="color"
                className="color-input"
                value={config.leftTextColor1}
                onChange={(e) => handleInputChange('leftTextColor1', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>왼쪽 박스 색상 2</label>
              <input
                type="color"
                className="color-input"
                value={config.leftTextColor2}
                onChange={(e) => handleInputChange('leftTextColor2', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>본문 내용</label>
            <textarea
              value={config.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="본문 내용을 입력하세요. 대화 부분은 따옴표로 감싸주세요."
              rows={15}
            />
          </div>

          <button className="button" onClick={copyToClipboard}>
            HTML 코드 복사
          </button>
        </div>

        <div className="preview-panel">
          <h2>미리보기</h2>
          
          {/* 미리보기용 커스텀 컴포넌트 */}
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '10px',
            backgroundColor: '#fff',
            minHeight: '400px',
            position: 'relative'
          }}>
            <div style={{
              border: 'solid 0px #e3e3e3',
              backgroundColor: 'rgba(250, 250, 250, 1)',
              borderRadius: '20px',
              position: 'relative',
              width: '100%',
              maxWidth: '700px',
              margin: '0px auto'
            }}>
              {/* 배경 이미지 컨테이너 */}
              <div style={{ 
                height: '85px', 
                margin: '0px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  backgroundImage: `url('${getPreviewImageUrl(config.backgroundImage)}')`,
                  backgroundSize: 'cover',
                  height: '170px',
                  backgroundPosition: '50% 40%',
                  borderRadius: '19px 19px 0px 0px',
                  backgroundColor: '#f0f0f0',
                  position: 'relative',
                  margin: '0px',
                  zIndex: 1
                }}>
                  {!previewImageLoaded && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#666',
                      fontSize: '12px',
                      textAlign: 'center',
                      zIndex: 2
                    }}>
                      <div>🖼️</div>
                      <div>이미지 로딩 중...</div>
                    </div>
                  )}
                  <div style={{ height: '130px', width: '100%', borderRadius: '19px 19px 0px 0px' }}>
                    <br />
                  </div>
                </div>
              </div>
              
              {/* 왼쪽 텍스트 박스 */}
              <div style={{
                background: `linear-gradient(135deg,rgba(${hexToRgb(config.leftTextColor1)}),rgba(${hexToRgb(config.leftTextColor2)}))`,
                backgroundSize: '110%',
                backgroundPosition: 'center',
                borderRadius: '10px',
                padding: '10px',
                lineHeight: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                boxShadow: '0px 0px 0px 3px rgba(233,233,233,0.9), inset 0px 40px 0px rgba(30,30,30,.1)',
                display: 'flex',
                width: 'fit-content',
                maxWidth: '300px',
                position: 'absolute',
                left: '6.5%',
                top: '155px',
                zIndex: 10
              }}>
                <span style={{
                  textDecoration: 'none',
                  color: '#ededed',
                  fontWeight: '600',
                  textShadow: '0px 0px 5px rgba(30,30,30,.1)'
                }}>
                  {config.leftText}
                </span>
              </div>
              
              {/* 오른쪽 텍스트 박스 */}
              <div style={{
                position: 'absolute',
                top: '155px',
                right: '0px',
                width: 'fit-content',
                maxWidth: '100%',
                backgroundColor: '#494949',
                borderRadius: '5px 0px 0px 5px',
                padding: '10px',
                lineHeight: '10px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#d5d5d5',
                fontSize: '0.7em',
                zIndex: 10
              }}>
                {config.rightText}
              </div>
              
              {/* 본문 컨테이너 */}
              <div style={{
                padding: '20px 7%',
                lineHeight: '22px',
                letterSpacing: '.35px',
                marginTop: '175px',
                position: 'relative',
                zIndex: 5
              }}>
                {config.content.split('\n\n').filter(p => p.trim()).map((paragraph, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    {paragraph.includes('"') && paragraph.includes('"') ? (
                      <p>
                        <span style={{ color: '#494949' }}>
                          {paragraph.split('"')[0]}
                        </span>
                        <span style={{
                          fontWeight: '500',
                          background: 'linear-gradient(to right,#2A4569,#497AA6)',
                          backgroundClip: 'text',
                          color: 'transparent'
                        }}>
                          "{paragraph.split('"')[1]}"
                        </span>
                        <span style={{ color: '#494949' }}>
                          {paragraph.split('"')[2] || ''}
                        </span>
                      </p>
                    ) : (
                      <p style={{ color: '#494949' }}>{paragraph}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="generated-html">
            {generateHTML()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 