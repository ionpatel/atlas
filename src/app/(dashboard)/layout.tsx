import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthHeader } from "@/components/layout/auth-header";
import { KeyboardProvider } from "@/components/layout/keyboard-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ErrorBoundaryWrapper } from "./error-wrapper";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demoMode = !isSupabaseConfigured();

  let userInfo = {
    email: "demo@atlas-erp.com",
    fullName: "Demo User",
    avatarUrl: null as string | null,
    orgName: "Atlas Demo" as string | null,
    role: "owner" as string | null,
  };

  if (!demoMode) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    // Get profile info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();

    // Get org info
    const { data: memberData } = await supabase
      .from("org_members")
      .select("role, organizations(name)")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    const orgName =
      (memberData?.organizations as unknown as { name: string } | null)
        ?.name ?? null;

    userInfo = {
      email: user.email!,
      fullName: profile?.full_name || user.user_metadata?.full_name || "",
      avatarUrl: profile?.avatar_url || null,
      orgName: orgName || null,
      role: memberData?.role || null,
    };
  }

  return (
    <KeyboardProvider>
      <div className="flex min-h-screen">
        {/* Skip link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#111] focus:rounded-lg focus:font-medium focus:text-sm focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <AuthHeader userInfo={userInfo} />
          <main id="main-content" className="flex-1 p-6" role="main">
            <ErrorBoundaryWrapper>
              {children}
            </ErrorBoundaryWrapper>
          </main>
        </div>
        <ToastProvider />
        <InstallPrompt />
      </div>
    </KeyboardProvider>
  );
}
