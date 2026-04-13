import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-base font-semibold text-red-600">Something went wrong</h2>
            <p className="mb-4 text-sm text-gray-600">
              An unexpected error occurred. Refresh the page or go back.
            </p>
            <pre className="mb-4 overflow-x-auto rounded-md bg-red-50 p-3 text-xs text-red-700">
              {this.state.error.message}
            </pre>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Refresh
              </button>
              <button
                onClick={() => window.history.back()}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
