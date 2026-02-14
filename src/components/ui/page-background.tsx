"use client";

// Simple elegant gradient background - #E8E3CC to #9C4A29
export function PageBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Main gradient - cream to cinnamon */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              135deg,
              #E8E3CC 0%,
              #E2DCBF 20%,
              #D8CEB0 40%,
              #C9B898 60%,
              #B89B78 75%,
              #A87350 88%,
              #9C4A29 100%
            )
          `,
        }}
      />
      
      {/* Subtle radial overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 120% 80% at 0% 0%,
              rgba(232, 227, 204, 0.4) 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse 80% 100% at 100% 100%,
              rgba(156, 74, 41, 0.2) 0%,
              transparent 50%
            )
          `,
        }}
      />

      {/* Very subtle noise texture for premium feel */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
