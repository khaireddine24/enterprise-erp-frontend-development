import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, User } from "@/types";
import { STORAGE_KEYS } from "@/constants/app";
import { getPermissionsForRole } from "@/lib/permissions";

interface AuthState {
  session: AuthSession | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
  switchRole: (role: string) => void;
  hasPermission: (permission: string) => boolean;
}

const DEMO_USERS: Record<string, { firstName: string; lastName: string; role: string; department: string; position: string }> = {
  "admin@nexora.io": { firstName: "Ava", lastName: "Stone", role: "super_admin", department: "Executive", position: "Chief Executive Officer" },
  "accountant@nexora.io": { firstName: "Liam", lastName: "Carter", role: "accountant", department: "Finance", position: "Senior Accountant" },
  "sales@nexora.io": { firstName: "Maya", lastName: "Chen", role: "sales_manager", department: "Sales", position: "Sales Manager" },
  "hr@nexora.io": { firstName: "Noah", lastName: "Benali", role: "hr_manager", department: "Human Resources", position: "HR Manager" },
  "inventory@nexora.io": { firstName: "Sofia", lastName: "Rossi", role: "inventory_manager", department: "Operations", position: "Inventory Manager" },
};

function buildUser(email: string): User {
  const demo = DEMO_USERS[email.toLowerCase()] ?? DEMO_USERS["admin@nexora.io"];
  const now = new Date().toISOString();
  return {
    id: "usr_001",
    firstName: demo.firstName,
    lastName: demo.lastName,
    email: email.toLowerCase(),
    role: demo.role,
    permissions: getPermissionsForRole(demo.role),
    department: demo.department,
    position: demo.position,
    phone: "+14155550132",
    isActive: true,
    lastLoginAt: now,
    twoFactorEnabled: false,
    createdAt: now,
    updatedAt: now,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 700));
        const user = buildUser(email || "admin@nexora.io");
        const session: AuthSession = {
          user,
          accessToken: `mock_access_${Date.now()}`,
          refreshToken: `mock_refresh_${Date.now()}`,
          expiresAt: Date.now() + 8 * 60 * 60 * 1000,
        };
        set({ session, user, isAuthenticated: true, isLoading: false });
        return user;
      },
      logout: () => {
        set({ session: null, user: null, isAuthenticated: false });
      },
      setUser: (user: User) => {
        const { session } = get();
        set({ user, session: session ? { ...session, user } : null });
      },
      switchRole: (role: string) => {
        const { user, session } = get();
        if (!user) return;
        const updated: User = { ...user, role, permissions: getPermissionsForRole(role), updatedAt: new Date().toISOString() };
        set({ user: updated, session: session ? { ...session, user: updated } : session });
      },
      hasPermission: (permission: string) => {
        const { user } = get();
        return !!user?.permissions.includes(permission);
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (s) => ({ session: s.session, user: s.user, isAuthenticated: s.isAuthenticated }) as AuthState,
    }
  )
);
