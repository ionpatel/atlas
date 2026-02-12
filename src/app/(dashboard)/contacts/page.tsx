import { Users, Plus, Search, Filter, Mail, Phone } from "lucide-react";

const contacts = [
  { name: "MedSupply Co.", type: "Vendor", email: "orders@medsupply.com", phone: "(416) 555-0101", company: "MedSupply Corp" },
  { name: "HealthFirst Dist.", type: "Vendor", email: "sales@healthfirst.ca", phone: "(905) 555-0202", company: "HealthFirst" },
  { name: "Sarah Johnson", type: "Customer", email: "sarah.j@email.com", phone: "(647) 555-0303", company: "Walk-in" },
  { name: "CarePharm Ltd.", type: "Both", email: "info@carepharm.com", phone: "(416) 555-0404", company: "CarePharm" },
  { name: "Dr. Michael Chen", type: "Customer", email: "m.chen@clinic.ca", phone: "(905) 555-0505", company: "Chen Medical" },
];

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Vendor: "bg-purple-500/10 text-purple-500",
    Customer: "bg-blue-500/10 text-blue-500",
    Both: "bg-amber-500/10 text-amber-500",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[type]}`}>{type}</span>;
}

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-1">Customers and vendors</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search contacts..." className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c) => (
          <div key={c.email} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{c.name[0]}</span>
              </div>
              <TypeBadge type={c.type} />
            </div>
            <h3 className="font-semibold text-sm">{c.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{c.company}</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="w-3 h-3" />
                {c.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" />
                {c.phone}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
