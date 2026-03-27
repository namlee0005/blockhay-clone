import { auth, signOut } from "@/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  LogOut,
} from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: Props) {
  const session = await auth();

  // Unauthenticated: render bare (middleware handles redirect; login page lands here)
  if (!session) {
    return <>{children}</>;
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-slate-900 text-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-700">
          <Link
            href="/admin"
            className="text-base font-bold text-white tracking-tight"
          >
            Blockhay <span className="text-orange-400">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-3" aria-label="Admin navigation">
          <NavLink href="/admin" icon={<LayoutDashboard size={15} />}>
            Dashboard
          </NavLink>
          <NavLink href="/admin/articles" icon={<FileText size={15} />}>
            Articles
          </NavLink>
          <NavLink href="/admin/categories" icon={<FolderOpen size={15} />}>
            Categories
          </NavLink>
          {isAdmin && (
            <NavLink href="/admin/users" icon={<Users size={15} />}>
              Users
            </NavLink>
          )}
        </nav>

        <div className="px-3 pb-4 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-400 truncate px-2 mb-2">
            {session.user.email}
            {" "}
            <span className="text-slate-500 capitalize">
              ({session.user.role})
            </span>
          </p>
          {/* Server action sign-out */}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-2 py-2 text-sm rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
