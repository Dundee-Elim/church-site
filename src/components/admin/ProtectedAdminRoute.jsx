import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function ProtectedAdminRoute({ children }) {
  const auth = useAdminAuth();
  const location = useLocation();

  if (auth.loading || (auth.isAuthenticated && !auth.adminChecked)) {
    return (
      <div className="admin-portal-theme flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-xl border border-border bg-card px-8 py-6 text-center shadow-sm">
          <div className="font-medium text-foreground">Checking admin session...</div>
          <div className="mt-2 text-sm text-muted-foreground">Please wait.</div>
        </div>
      </div>
    );
  }

  if (!auth.isConfigured) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!auth.isAdmin) {
    return (
      <div className="admin-portal-theme flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border border-border bg-card px-8 py-6 text-center shadow-sm">
          <div className="font-medium text-foreground">Access not authorised</div>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in, but this account is not on the admin allowlist. Ask an
            existing administrator to add your account, then sign in again.
          </p>
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="mt-5 inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return children;
}
