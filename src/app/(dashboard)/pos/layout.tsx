import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { KeyboardProvider } from "@/components/layout/keyboard-provider";
import { ToastProvider } from "@/components/ui/toast-provider";

export const dynamic = "force-dynamic";

export default async function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demoMode = !isSupabaseConfigured();

  if (!demoMode) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  }

  // POS uses a full-screen layout without sidebar
  return (
    <KeyboardProvider>
      {children}
      <ToastProvider />
    </KeyboardProvider>
  );
}
