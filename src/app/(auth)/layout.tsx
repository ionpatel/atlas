export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-[#CDB49E] flex items-center justify-center">
            <span className="text-[#111111] font-bold text-lg">A</span>
          </div>
          <span className="text-[#f5f0eb] text-2xl font-semibold tracking-tight">
            Atlas
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl shadow-black/20">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#888888]/60 mt-8 uppercase tracking-widest">
          Enterprise Resource Planning
        </p>
      </div>
    </div>
  );
}
