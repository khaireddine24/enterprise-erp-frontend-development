import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/constants/app";
import { useAuth } from "@/hooks/core";
import { Alert, Button, FormField, Input } from "@/components/ui/primitives";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").min(4, "Password must be at least 4 characters"),
  remember: z.boolean().optional(),
});
type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const expired = params.get("expired") === "1";

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@nexora.io", password: "password", remember: true },
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch {
      setError("Invalid credentials. Please try again.");
    }
  };

  const demoAccounts = [
    { email: "admin@nexora.io", role: "Super Admin" },
    { email: "sales@nexora.io", role: "Sales Manager" },
    { email: "accountant@nexora.io", role: "Accountant" },
    { email: "hr@nexora.io", role: "HR Manager" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your workspace to continue.</p>

      {expired && <Alert variant="warning" className="mt-4">Your session has expired. Please sign in again.</Alert>}
      {error && <Alert variant="danger" className="mt-4">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <FormField label="Work email" error={errors.email?.message} required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input {...register("email")} type="email" placeholder="you@company.com" className="pl-9" autoComplete="email" error={errors.email?.message} />
          </div>
        </FormField>
        <FormField label="Password" error={errors.password?.message} required>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-9 pr-10" autoComplete="current-password" error={errors.password?.message} />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between text-[13px]">
          <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
            <input type="checkbox" {...register("remember")} className="h-4 w-4 rounded accent-primary" /> Remember me
          </label>
          <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-primary hover:underline">Forgot password?</Link>
        </div>

        <Button type="submit" loading={isLoading} className="w-full" size="lg">Sign in</Button>
      </form>

      <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo accounts — click to fill</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {demoAccounts.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => { setValue("email", a.email); setValue("password", "password"); }}
              className="rounded-lg border border-border bg-card px-3 py-2 text-left text-xs hover:border-primary hover:bg-primary/5"
            >
              <span className="block font-semibold">{a.role}</span>
              <span className="block truncate text-muted-foreground">{a.email}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Any password works in demo mode. Permissions change per role — try the Sales Manager view.</p>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Protected by 2FA & SSO · <span className="inline-flex items-center gap-1 font-medium text-emerald-600"><ShieldCheck className="h-3 w-3" /> SOC 2 compliant</span>
      </p>
    </div>
  );
}

const emailSchema = z.object({ email: z.string().min(1, "Email is required").email("Enter a valid email address") });

export function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>({ resolver: zodResolver(emailSchema) });
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">We'll email you a secure reset link.</p>
      {sent ? (
        <Alert variant="success" className="mt-6">Reset link sent. Check your inbox and follow the instructions (valid for 30 minutes).</Alert>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(async () => { await new Promise((r) => setTimeout(r, 800)); setSent(true); })} noValidate>
          <FormField label="Work email" error={errors.email?.message} required>
            <Input {...register("email")} type="email" placeholder="you@company.com" error={errors.email?.message} />
          </FormField>
          <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Send reset link</Button>
        </form>
      )}
      <Link to={ROUTES.LOGIN} className="mt-6 block text-center text-sm font-medium text-primary hover:underline">Back to sign in</Link>
    </div>
  );
}

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [done, setDone] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Create new password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Choose a strong password for your account.</p>
      {done ? (
        <div className="mt-6 space-y-4">
          <Alert variant="success">Password updated successfully.</Alert>
          <Button className="w-full" onClick={() => navigate(ROUTES.LOGIN)}>Continue to sign in</Button>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(async () => { await new Promise((r) => setTimeout(r, 800)); setDone(true); })} noValidate>
          <FormField label="New password" error={errors.password?.message} required>
            <Input {...register("password")} type="password" placeholder="Min. 8 characters" error={errors.password?.message} />
          </FormField>
          <FormField label="Confirm password" error={errors.confirm?.message} required>
            <Input {...register("confirm")} type="password" placeholder="Repeat password" error={errors.confirm?.message} />
          </FormField>
          <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Update password</Button>
        </form>
      )}
    </div>
  );
}

export function Verify2FAPage() {
  const navigate = useNavigate();
  const [code, setCode] = React.useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = React.useState(false);
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...code];
    next[i] = v.slice(-1);
    setCode(next);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const verify = async () => {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 900));
    navigate(ROUTES.DASHBOARD, { replace: true });
  };

  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Two-factor authentication</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
      <div className="mt-6 flex gap-2" role="group" aria-label="Verification code">
        {code.map((c, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            value={c}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Backspace" && !c && i > 0) inputs.current[i - 1]?.focus(); }}
            className="h-12 w-full rounded-lg border border-input bg-card text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      <Button className="mt-6 w-full" size="lg" loading={verifying} disabled={code.some((c) => !c)} onClick={verify}>Verify & continue</Button>
      <button className="mt-3 w-full text-center text-sm font-medium text-primary hover:underline">Resend code</button>
    </div>
  );
}
