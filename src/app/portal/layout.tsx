import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Portal | Atlas ERP",
  description: "View your invoices, orders, and manage your account",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#E8E3CC]">
      {children}
    </div>
  );
}
