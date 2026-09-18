import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('markryan_poems');
      localStorage.removeItem('markryan_curiosities');
      localStorage.removeItem('markryan_computer');
      localStorage.removeItem('markryan_diary');
      localStorage.removeItem('markryan_blog_comments');
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f3f3f4] flex items-center justify-center p-4 font-sans text-stone-900">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-stone-200 shadow-xl text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#722F37]/10 text-[#722F37] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="font-cormorant text-2xl font-bold text-stone-900 tracking-tight">
                Something went wrong
              </h1>
              <p className="text-stone-600 text-sm font-baskerville leading-relaxed">
                The application encountered an unexpected display issue while rendering. Your portfolio content remains safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-stone-100 rounded-lg text-left text-xs font-mono text-stone-700 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#722F37] hover:bg-[#581c24] text-white text-sm font-medium transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload &amp; Restore Display</span>
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
