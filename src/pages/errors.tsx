import { Link } from "react-router-dom";
import { AlertTriangle, FileQuestion, Lock, ServerCrash } from "lucide-react";
import { ROUTES } from "@/constants/app";
import { Button } from "@/components/ui/primitives";

function Shell({ code, title, message, icon }: { code: string; title: string; message: string; icon: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <span className="rounded-2xl bg-muted p-4 text-muted-foreground">{icon}</span>
      <p className="mt-5 text-6xl font-black tracking-tight text-foreground/90">{code}</p>
      <h1 className="mt-2 text-xl font-bold">{title}</h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex gap-2">
        <Link to={ROUTES.DASHBOARD}><Button>Back to dashboard</Button></Link>
        <Link to={ROUTES.LOGIN}><Button variant="outline">Sign in</Button></Link>
      </div>
      <p className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5" /> Error reference: ERR-{code}-{Date.now().toString(36).toUpperCase()}
      </p>
    </div>
  );
}

export function NotFoundPage() {
  return <Shell code="404" title="Page not found" message="The page you're looking for doesn't exist or was moved. Check the URL or return to safety." icon={<FileQuestion className="h-8 w-8" />} />;
}

export function ForbiddenPage() {
  return <Shell code="403" title="Access forbidden" message="Your role doesn't have permission to view this page. Contact your administrator to request access." icon={<Lock className="h-8 w-8" />} />;
}

export function ServerErrorPage() {
  return <Shell code="500" title="Something went wrong" message="We're having trouble on our end. The team has been notified — please try again in a moment." icon={<ServerCrash className="h-8 w-8" />} />;
}

export function OfflinePage() {
  return <Shell code="OFF" title="You're offline" message="Check your internet connection. Your work is saved locally and will sync when you're back." icon={<AlertTriangle className="h-8 w-8" />} />;
}
