import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 에러 경계 컴포넌트
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
          <h2>앱을 로드하는 중 오류가 발생했습니다</h2>
          <details>
            <summary>오류 상세 정보</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
  console.log('React 앱이 성공적으로 마운트되었습니다');
} catch (error) {
  console.error('React 앱 마운트 중 오류 발생:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; background-color: #ffebee; border: 1px solid #f44336; border-radius: 4px; margin: 20px;">
      <h2>앱을 로드하는 중 오류가 발생했습니다</h2>
      <p>브라우저의 개발자 도구 콘솔을 확인해주세요.</p>
      <pre style="font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 4px;">
        ${error.toString()}
      </pre>
    </div>
  `;
} 