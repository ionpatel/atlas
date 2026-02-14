export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6D4C7] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-[#273B3A] flex items-center justify-center">
            <span className="text-[#E6D4C7] font-bold text-lg">A</span>
          </div>
          <span className="text-[#273B3A] text-2xl font-semibold tracking-tight">
            Atlas
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#E6D4C7] border border-[#E6D4C7] rounded-2xl p-8 shadow-2xl shadow-black/20">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#273B3A]/60 mt-8 uppercase tracking-widest">
          Enterprise Resource Planning
        </p>
      </div>
    </div>
  );
}
