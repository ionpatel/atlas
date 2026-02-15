export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#CDB49E] to-[#B89B78] flex items-center justify-center shadow-lg shadow-[#CDB49E]/10">
            <span className="text-[#0A0A0A] font-bold text-lg">A</span>
          </div>
          <span className="text-[#FAFAFA] text-2xl font-semibold tracking-tight">
            Atlas
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-8 shadow-2xl shadow-black/20">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#FAFAFA]/60 mt-8 uppercase tracking-widest">
          Enterprise Resource Planning
        </p>
      </div>
    </div>
  );
}
