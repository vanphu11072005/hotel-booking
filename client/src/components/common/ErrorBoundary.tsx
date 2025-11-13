import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 
          flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-white 
            rounded-lg shadow-lg p-8"
          >
            <div className="flex items-center 
              justify-center w-16 h-16 bg-red-100 
              rounded-full mx-auto mb-4"
            >
              <AlertCircle className="w-8 h-8 
                text-red-600" 
              />
            </div>

            <h1 className="text-2xl font-bold 
              text-gray-900 text-center mb-2"
            >
              Đã xảy ra lỗi
            </h1>

            <p className="text-gray-600 text-center mb-6">
              Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại 
              hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
            </p>

            {process.env.NODE_ENV === 'development' && 
              this.state.error && (
              <div className="bg-red-50 border 
                border-red-200 rounded-lg p-4 mb-6"
              >
                <p className="text-sm font-mono 
                  text-red-800 break-all"
                >
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-sm 
                      text-red-700 cursor-pointer 
                      hover:text-red-800"
                    >
                      Chi tiết lỗi
                    </summary>
                    <pre className="mt-2 text-xs 
                      text-red-600 overflow-auto 
                      max-h-40"
                    >
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center 
                  justify-center gap-2 bg-indigo-600 
                  text-white px-6 py-3 rounded-lg 
                  hover:bg-indigo-700 transition-colors 
                  font-semibold"
              >
                <RefreshCw className="w-5 h-5" />
                Tải lại trang
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-200 
                  text-gray-700 px-6 py-3 rounded-lg 
                  hover:bg-gray-300 transition-colors 
                  font-semibold"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
