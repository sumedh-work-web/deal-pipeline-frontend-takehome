import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <main className="flex h-screen w-screen flex-col items-center justify-center bg-[linear-gradient(135deg,#f4f7fb_0%,#eef4f8_48%,#eff2ff_100%)] p-6 text-center text-ink">
          <div className="max-w-md rounded-lg border border-red-200 bg-white p-8 shadow-soft">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/45">
              <AlertOctagon className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-xl font-bold tracking-tight text-ink">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              The application crashed due to a critical rendering or data evaluation error.
            </p>
            <div className="mt-4 rounded bg-slate-50 p-3 text-left text-xs font-mono text-red-600 border border-slate-200 max-h-32 overflow-y-auto">
              {this.state.error?.message ?? 'Unknown error'}
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-all active:scale-95 focus:outline-none"
            >
              <RotateCcw className="h-4 w-4" /> Reload dashboard
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
