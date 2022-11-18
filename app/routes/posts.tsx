import { Outlet } from "@remix-run/react"

export default function PostsRoute() {
    return (<Outlet />)
}

// this will catch unhandled errors that are thrown, and errors bubble up so these can be placed at the parent level
// this is typed as 'unknown' so that it catches anything thrown. if it's really an error then we will show the error dialog, otherwise a generic error dialog will be shown
export function ErrorBoundary({ error }: { error: unknown }) {

    if (error instanceof Error){
    return (
      <div className="text-red-500">
        <h1>Error 🐨</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
    }

    return ( <div className="text-red-500">
        Oh No! Something went wrong!
    </div>)
  }