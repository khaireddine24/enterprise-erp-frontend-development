import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/app";
import { useAuthStore } from "@/stores/auth.store";
import { PageContainer, PermissionDenied } from "@/components/common/feedback";

export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const session = useAuthStore((s) => s.session);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }
  if (session && session.expiresAt < Date.now()) {
    useAuthStore.getState().logout();
    return <Navigate to={`${ROUTES.LOGIN}?expired=1`} replace />;
  }
  return <Outlet />;
}

export function RequirePermission({ permission, module, children }: {
  permission: string | string[];
  module?: string;
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const perms = user?.permissions ?? [];
  const ok = Array.isArray(permission) ? permission.some((p) => perms.includes(p)) : perms.includes(permission);
  if (!ok) {
    return (
      <PageContainer>
        <PermissionDenied module={module} />
      </PageContainer>
    );
  }
  return <>{children}</>;
}

export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <>{children}</>;
}
