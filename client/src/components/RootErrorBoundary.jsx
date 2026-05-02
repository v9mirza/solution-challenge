import { Component } from "react";

export class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const message = error?.message ?? String(error);
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-white p-6 shadow-lg">
          <h1 className="text-lg font-bold text-rose-800">Application error</h1>
          <p className="mt-2 text-sm text-slate-600">
            The UI crashed while loading. Refresh the page, or clear site data if it keeps happening.
          </p>
          <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-slate-100 p-3 text-xs whitespace-pre-wrap break-words">
            {message}
          </pre>
        </div>
      </div>
    );
  }
}
