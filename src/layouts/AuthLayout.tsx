import { Outlet } from "react-router-dom";
import { BarChart3, Boxes, ShieldCheck, Users } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0b1b33] p-10 text-white lg:flex">
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #3b82f6 0, transparent 40%), radial-gradient(circle at 80% 70%, #10b981 0, transparent 35%)" }} aria-hidden />
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-[#0b1b33]">N</span>
          <div>
            <p className="text-lg font-bold">Nexora ERP</p>
            <p className="text-xs text-white/60">Enterprise Resource Planning</p>
          </div>
        </div>
        <div className="relative space-y-8">
          <div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight">One platform for your entire business.</h1>
            <p className="mt-3 max-w-md text-sm text-white/70">Finance, sales, inventory, HR, projects and reporting — unified in a single secure workspace trusted by 2,400+ companies.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <BarChart3 className="h-5 w-5" />, title: "Real-time analytics", desc: "Live KPIs across all modules" },
              { icon: <Users className="h-5 w-5" />, title: "Role-based access", desc: "11 roles, 60+ permissions" },
              { icon: <Boxes className="h-5 w-5" />, title: "12 modules", desc: "CRM to accounting to HR" },
              { icon: <ShieldCheck className="h-5 w-5" />, title: "Enterprise security", desc: "2FA, audit logs, SSO-ready" },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <span className="text-sky-300">{f.icon}</span>
                <p className="mt-2 text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/50">© 2026 Nexora Industries · SOC 2 Type II · ISO 27001</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">N</span>
            <p className="text-lg font-bold">Nexora ERP</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
