"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

// Premium animated background with floating shapes and gradient mesh
export function PageBackground() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate consistent random positions based on pathname
  const shapes = useMemo(() => {
    const seed = pathname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (i: number) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: 150 + random(i) * 300,
      x: random(i * 2) * 100,
      y: random(i * 3) * 100,
      duration: 20 + random(i * 4) * 30,
      delay: random(i * 5) * -20,
      opacity: 0.03 + random(i * 6) * 0.04,
    }));
  }, [pathname]);

  // Floating particles
  const particles = useMemo(() => {
    const seed = pathname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (i: number) => ((seed * (i + 1) * 7919 + 104729) % 233280) / 233280;
    
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: 2 + random(i) * 4,
      x: random(i * 2) * 100,
      y: random(i * 3) * 100,
      duration: 15 + random(i * 4) * 25,
      delay: random(i * 5) * -15,
    }));
  }, [pathname]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(156, 74, 41, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 60% at 80% 20%, rgba(156, 74, 41, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 50% 80% at 60% 80%, rgba(156, 74, 41, 0.05) 0%, transparent 50%),
            linear-gradient(180deg, rgba(232, 227, 204, 0) 0%, rgba(221, 215, 192, 0.3) 100%)
          `
        }}
      />

      {/* Animated gradient mesh */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Gradient definitions */}
            <radialGradient id="mesh1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9C4A29" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#9C4A29" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mesh2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7D3B21" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#7D3B21" stopOpacity="0" />
            </radialGradient>
            
            {/* Blur filter */}
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
            </filter>
          </defs>

          {/* Animated mesh blobs */}
          {shapes.map((shape) => (
            <circle
              key={shape.id}
              r={shape.size}
              fill={shape.id % 2 === 0 ? "url(#mesh1)" : "url(#mesh2)"}
              filter="url(#blur)"
              style={{
                animation: `float-${shape.id % 4} ${shape.duration}s ease-in-out infinite`,
                animationDelay: `${shape.delay}s`,
                transformOrigin: 'center',
                cx: `${shape.x}%`,
                cy: `${shape.y}%`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {shapes.slice(0, 6).map((shape, i) => (
          <div
            key={`geo-${shape.id}`}
            className="absolute"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              animation: `float-geo ${shape.duration}s ease-in-out infinite, rotate-slow ${shape.duration * 2}s linear infinite`,
              animationDelay: `${shape.delay}s`,
            }}
          >
            {i % 3 === 0 ? (
              // Circle
              <div 
                className="rounded-full border border-cinnamon/10"
                style={{ 
                  width: shape.size * 0.3, 
                  height: shape.size * 0.3,
                  opacity: shape.opacity * 1.5,
                }}
              />
            ) : i % 3 === 1 ? (
              // Square
              <div 
                className="border border-cinnamon/10 rounded-lg"
                style={{ 
                  width: shape.size * 0.25, 
                  height: shape.size * 0.25,
                  opacity: shape.opacity * 1.5,
                  transform: 'rotate(45deg)',
                }}
              />
            ) : (
              // Triangle (using borders)
              <div 
                style={{ 
                  width: 0,
                  height: 0,
                  borderLeft: `${shape.size * 0.15}px solid transparent`,
                  borderRight: `${shape.size * 0.15}px solid transparent`,
                  borderBottom: `${shape.size * 0.25}px solid rgba(156, 74, 41, ${shape.opacity * 1.5})`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Floating particles/dots */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className="absolute rounded-full bg-cinnamon"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: 0.08,
              animation: `particle-float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(156, 74, 41, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(156, 74, 41, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(45, 24, 16, 0.03) 100%)',
        }}
      />

      {/* Animated gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
        <div 
          className="h-full w-[200%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(156, 74, 41, 0.3), rgba(156, 74, 41, 0.5), rgba(156, 74, 41, 0.3), transparent)',
            animation: 'shimmer-line 8s ease-in-out infinite',
          }}
        />
      </div>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -20px) scale(1.05); }
          50% { transform: translate(-20px, 30px) scale(0.95); }
          75% { transform: translate(20px, 20px) scale(1.02); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.03); }
          66% { transform: translate(30px, -30px) scale(0.97); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, 25px) scale(1.04); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-20px, -30px) scale(0.96); }
          75% { transform: translate(35px, 15px) scale(1.06); }
        }
        @keyframes float-geo {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-15px) translateX(10px); }
          50% { transform: translateY(5px) translateX(-8px); }
          75% { transform: translateY(-8px) translateX(12px); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.08; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.12; }
          50% { transform: translateY(10px) translateX(-15px); opacity: 0.06; }
          75% { transform: translateY(-10px) translateX(20px); opacity: 0.1; }
        }
        @keyframes shimmer-line {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
}
