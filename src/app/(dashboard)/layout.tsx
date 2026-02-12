import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthHeader } from "@/components/layout/auth-header";
import { ToastProvider } from "@/components/ui/toast-provider";

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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AuthHeader userInfo={userInfo} />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <ToastProvider />
    </div>
  );
}
