"use client";

import { usePathname } from "next/navigation";

// SVG patterns for each module - subtle, professional business graphics
const patterns: Record<string, React.ReactNode> = {
  dashboard: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dashboard-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Bar chart */}
          <rect x="10" y="60" width="12" height="40" fill="currentColor" opacity="0.04" rx="2"/>
          <rect x="26" y="40" width="12" height="60" fill="currentColor" opacity="0.04" rx="2"/>
          <rect x="42" y="50" width="12" height="50" fill="currentColor" opacity="0.04" rx="2"/>
          {/* Line chart */}
          <path d="M70 80 L85 60 L100 70 L115 40" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.04"/>
          <circle cx="70" cy="80" r="3" fill="currentColor" opacity="0.04"/>
          <circle cx="85" cy="60" r="3" fill="currentColor" opacity="0.04"/>
          <circle cx="100" cy="70" r="3" fill="currentColor" opacity="0.04"/>
          <circle cx="115" cy="40" r="3" fill="currentColor" opacity="0.04"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dashboard-pattern)"/>
    </svg>
  ),
  
  inventory: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="inventory-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Package box */}
          <rect x="20" y="30" width="30" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.05" rx="2"/>
          <line x1="20" y1="42" x2="50" y2="42" stroke="currentColor" strokeWidth="1" opacity="0.05"/>
          <line x1="35" y1="30" x2="35" y2="42" stroke="currentColor" strokeWidth="1" opacity="0.05"/>
          {/* Barcode */}
          <rect x="60" y="35" width="2" height="15" fill="currentColor" opacity="0.04"/>
          <rect x="64" y="35" width="1" height="15" fill="currentColor" opacity="0.04"/>
          <rect x="67" y="35" width="3" height="15" fill="currentColor" opacity="0.04"/>
          <rect x="72" y="35" width="1" height="15" fill="currentColor" opacity="0.04"/>
          <rect x="75" y="35" width="2" height="15" fill="currentColor" opacity="0.04"/>
          <rect x="79" y="35" width="1" height="15" fill="currentColor" opacity="0.04"/>
          {/* Stacked boxes */}
          <rect x="25" y="65" width="18" height="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="1"/>
          <rect x="30" y="58" width="18" height="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#inventory-pattern)"/>
    </svg>
  ),
  
  invoices: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="invoices-pattern" x="0" y="0" width="100" height="120" patternUnits="userSpaceOnUse">
          {/* Document */}
          <rect x="20" y="20" width="35" height="45" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.05" rx="2"/>
          <line x1="28" y1="32" x2="47" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <line x1="28" y1="40" x2="47" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <line x1="28" y1="48" x2="40" y2="48" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          {/* Dollar sign */}
          <text x="70" y="50" fontSize="24" fill="currentColor" opacity="0.04" fontWeight="600">$</text>
          {/* Check mark */}
          <path d="M65 80 L72 87 L85 70" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.04" strokeLinecap="round" strokeLinejoin="round"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#invoices-pattern)"/>
    </svg>
  ),
  
  contacts: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="contacts-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Person icon */}
          <circle cx="35" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.05"/>
          <path d="M20 60 Q35 45 50 60" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.05"/>
          {/* Connection lines */}
          <circle cx="75" cy="35" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <circle cx="75" cy="65" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <line x1="75" y1="41" x2="75" y2="59" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          {/* Card */}
          <rect x="20" y="70" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="2"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#contacts-pattern)"/>
    </svg>
  ),
  
  crm: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="crm-pattern" x="0" y="0" width="120" height="100" patternUnits="userSpaceOnUse">
          {/* Funnel */}
          <path d="M20 25 L50 25 L42 45 L42 60 L28 60 L28 45 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.05"/>
          {/* Target */}
          <circle cx="85" cy="45" r="18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <circle cx="85" cy="45" r="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <circle cx="85" cy="45" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <circle cx="85" cy="45" r="2" fill="currentColor" opacity="0.05"/>
          {/* Handshake simplified */}
          <path d="M30 80 Q45 70 60 80" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.04"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#crm-pattern)"/>
    </svg>
  ),
  
  accounting: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="accounting-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Calculator */}
          <rect x="20" y="20" width="30" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.05" rx="3"/>
          <rect x="24" y="24" width="22" height="10" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="24" y="38" width="5" height="5" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="32" y="38" width="5" height="5" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="40" y="38" width="5" height="5" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="24" y="46" width="5" height="5" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="32" y="46" width="5" height="5" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="40" y="46" width="5" height="5" fill="currentColor" opacity="0.03" rx="1"/>
          {/* Pie chart */}
          <circle cx="70" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <path d="M70 50 L70 35 A15 15 0 0 1 82 58 Z" fill="currentColor" opacity="0.03"/>
          {/* Coins */}
          <ellipse cx="75" cy="85" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <ellipse cx="75" cy="82" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#accounting-pattern)"/>
    </svg>
  ),
  
  employees: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="employees-pattern" x="0" y="0" width="120" height="100" patternUnits="userSpaceOnUse">
          {/* Team of people */}
          <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <path d="M18 55 Q30 42 42 55" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <circle cx="55" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <path d="M43 53 Q55 40 67 53" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <circle cx="80" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <path d="M68 55 Q80 42 92 55" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          {/* ID badge */}
          <rect x="35" y="65" width="24" height="30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="2"/>
          <circle cx="47" cy="76" r="5" fill="currentColor" opacity="0.03"/>
          <rect x="40" y="84" width="14" height="2" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="42" y="88" width="10" height="2" fill="currentColor" opacity="0.03" rx="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#employees-pattern)"/>
    </svg>
  ),
  
  settings: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="settings-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Gear */}
          <circle cx="40" cy="45" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.05"/>
          <circle cx="40" cy="45" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          {/* Gear teeth */}
          <rect x="37" y="28" width="6" height="6" fill="currentColor" opacity="0.04" rx="1"/>
          <rect x="37" y="56" width="6" height="6" fill="currentColor" opacity="0.04" rx="1"/>
          <rect x="23" y="42" width="6" height="6" fill="currentColor" opacity="0.04" rx="1"/>
          <rect x="51" y="42" width="6" height="6" fill="currentColor" opacity="0.04" rx="1"/>
          {/* Sliders */}
          <line x1="65" y1="35" x2="90" y2="35" stroke="currentColor" strokeWidth="2" opacity="0.04"/>
          <circle cx="75" cy="35" r="4" fill="currentColor" opacity="0.04"/>
          <line x1="65" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" opacity="0.04"/>
          <circle cx="82" cy="50" r="4" fill="currentColor" opacity="0.04"/>
          <line x1="65" y1="65" x2="90" y2="65" stroke="currentColor" strokeWidth="2" opacity="0.04"/>
          <circle cx="70" cy="65" r="4" fill="currentColor" opacity="0.04"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#settings-pattern)"/>
    </svg>
  ),
  
  projects: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="projects-pattern" x="0" y="0" width="120" height="100" patternUnits="userSpaceOnUse">
          {/* Kanban board */}
          <rect x="15" y="20" width="25" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="2"/>
          <rect x="45" y="20" width="25" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="2"/>
          <rect x="75" y="20" width="25" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="2"/>
          {/* Cards */}
          <rect x="18" y="28" width="19" height="12" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="18" y="44" width="19" height="12" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="48" y="28" width="19" height="12" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="78" y="28" width="19" height="12" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="78" y="44" width="19" height="12" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="78" y="60" width="19" height="12" fill="currentColor" opacity="0.03" rx="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#projects-pattern)"/>
    </svg>
  ),
  
  sales: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="sales-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Shopping cart */}
          <circle cx="32" cy="70" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <circle cx="52" cy="70" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <path d="M20 30 L28 30 L35 55 L55 55 L60 40 L30 40" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.05"/>
          {/* Trending up */}
          <path d="M70 65 L80 50 L90 55 L100 35" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.04"/>
          <path d="M95 35 L100 35 L100 40" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.04"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sales-pattern)"/>
    </svg>
  ),
  
  purchase: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="purchase-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Clipboard with list */}
          <rect x="25" y="15" width="30" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.05" rx="2"/>
          <rect x="35" y="10" width="10" height="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="2"/>
          <line x1="32" y1="28" x2="48" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <line x1="32" y1="36" x2="48" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <line x1="32" y1="44" x2="42" y2="44" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          {/* Truck */}
          <rect x="60" y="50" width="25" height="18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="2"/>
          <rect x="85" y="55" width="10" height="13" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="1"/>
          <circle cx="68" cy="70" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <circle cx="88" cy="70" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#purchase-pattern)"/>
    </svg>
  ),
  
  pos: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pos-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Cash register */}
          <rect x="20" y="35" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.05" rx="3"/>
          <rect x="25" y="40" width="30" height="12" fill="currentColor" opacity="0.03" rx="1"/>
          <rect x="20" y="55" width="40" height="5" fill="currentColor" opacity="0.03"/>
          {/* Credit card */}
          <rect x="65" y="40" width="28" height="18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" rx="2"/>
          <rect x="68" y="48" width="15" height="3" fill="currentColor" opacity="0.03" rx="1"/>
          {/* Receipt */}
          <path d="M70 65 L70 90 L85 90 L85 65 L82 68 L79 65 L76 68 L73 65 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pos-pattern)"/>
    </svg>
  ),
  
  default: (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="default-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          {/* Simple grid dots */}
          <circle cx="30" cy="30" r="1.5" fill="currentColor" opacity="0.04"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#default-pattern)"/>
    </svg>
  ),
};

// Map routes to pattern keys
function getPatternKey(pathname: string): string {
  if (pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/inventory')) return 'inventory';
  if (pathname.includes('/invoices') || pathname.includes('/quotations') || pathname.includes('/credit-notes')) return 'invoices';
  if (pathname.includes('/contacts')) return 'contacts';
  if (pathname.includes('/crm')) return 'crm';
  if (pathname.includes('/accounting') || pathname.includes('/expenses')) return 'accounting';
  if (pathname.includes('/employees') || pathname.includes('/payroll')) return 'employees';
  if (pathname.includes('/settings')) return 'settings';
  if (pathname.includes('/projects')) return 'projects';
  if (pathname.includes('/sales')) return 'sales';
  if (pathname.includes('/purchase')) return 'purchase';
  if (pathname.includes('/pos')) return 'pos';
  if (pathname.includes('/documents') || pathname.includes('/contracts')) return 'invoices';
  if (pathname.includes('/reports')) return 'dashboard';
  if (pathname.includes('/apps')) return 'settings';
  return 'default';
}

export function PageBackground() {
  const pathname = usePathname();
  const patternKey = getPatternKey(pathname);
  const pattern = patterns[patternKey] || patterns.default;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden text-cinnamon z-0">
      {pattern}
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cream-dark/30" />
    </div>
  );
}
