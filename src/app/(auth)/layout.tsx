import Image from "next/image";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <Image src="/logo.png" alt="Atlas" width={44} height={44} />
          <span className="text-[#111827] text-2xl font-bold tracking-tight">Atlas</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-card">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#9CA3AF] mt-8 uppercase tracking-widest">
          Enterprise Resource Planning
        </p>
      </div>
    </div>
  );
}
