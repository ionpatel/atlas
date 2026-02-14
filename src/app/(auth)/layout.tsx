export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8E3CC] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-[#9C4A29] flex items-center justify-center">
            <span className="text-[#E8E3CC] font-bold text-lg">A</span>
          </div>
          <span className="text-[#2D1810] text-2xl font-semibold tracking-tight">
            Atlas
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-2xl p-8 shadow-2xl shadow-black/20">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#6B5B4F]/60 mt-8 uppercase tracking-widest">
          Enterprise Resource Planning
        </p>
      </div>
    </div>
  );
}
