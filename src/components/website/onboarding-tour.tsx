"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  X, ChevronRight, ChevronLeft, Sparkles, Layout, Palette, Eye, 
  Save, Keyboard, Zap, ArrowRight, CheckCircle, Rocket 
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ONBOARDING TOUR
   First-time user tutorial with step-by-step guidance
   ═══════════════════════════════════════════════════════════════════════════ */

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  target?: string; // CSS selector for highlighting
  position?: "center" | "top" | "bottom" | "left" | "right";
  highlight?: boolean;
  action?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Atlas Website Builder! 🎉",
    description: "Build stunning websites in minutes with our powerful drag-and-drop editor. Let's take a quick tour of the key features.",
    icon: Sparkles,
    position: "center",
  },
  {
    id: "templates",
    title: "Start with a Template",
    description: "Choose from our collection of 17+ professional templates across fitness, SaaS, e-commerce, and more. Each template is fully customizable.",
    icon: Layout,
    target: "[data-tour='templates']",
    position: "right",
  },
  {
    id: "components",
    title: "90+ Drag & Drop Components",
    description: "Add heroes, features, testimonials, pricing tables, forms, and more. Just click to add any component to your page.",
    icon: Zap,
    target: "[data-tour='components']",
    position: "right",
  },
  {
    id: "editor",
    title: "Visual Editor",
    description: "Click any element to select it. Use the right panel to customize styles, content, and animations. Drag to reorder.",
    icon: Palette,
    target: "[data-tour='canvas']",
    position: "center",
  },
  {
    id: "preview",
    title: "Responsive Preview",
    description: "Switch between desktop, tablet, and mobile views to see how your site looks on all devices. Use ⌘P to toggle preview mode.",
    icon: Eye,
    target: "[data-tour='device-toggle']",
    position: "bottom",
  },
  {
    id: "save",
    title: "Auto-Save & Version History",
    description: "Your work is automatically saved. Access previous versions anytime to restore earlier designs.",
    icon: Save,
    target: "[data-tour='save']",
    position: "bottom",
  },
  {
    id: "shortcuts",
    title: "Keyboard Shortcuts",
    description: "Speed up your workflow with shortcuts. Press ⌘K to open the command palette and quickly access any action.",
    icon: Keyboard,
    position: "center",
  },
  {
    id: "complete",
    title: "You're All Set! 🚀",
    description: "Start building your website now. Remember: ⌘K for commands, ⌘P for preview, and ⌘/ for shortcuts. Happy building!",
    icon: Rocket,
    position: "center",
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const goNext = useCallback(() => {
    if (isLast) {
      onComplete?.();
      onClose();
      // Save completion to localStorage
      localStorage.setItem("atlas-onboarding-complete", "true");
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(s => s + 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [isLast, onComplete, onClose]);

  const goPrev = useCallback(() => {
    if (!isFirst) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(s => s - 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [isFirst]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowRight" || e.key === "Enter") {
      goNext();
    } else if (e.key === "ArrowLeft") {
      goPrev();
    }
  }, [isOpen, onClose, goNext, goPrev]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Highlight target element
  useEffect(() => {
    if (!isOpen || !step.target) return;
    
    const el = document.querySelector(step.target);
    if (el) {
      el.classList.add("tour-highlight");
      return () => el.classList.remove("tour-highlight");
    }
  }, [isOpen, step.target]);

  if (!isOpen) return null;

  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Tour Card */}
      <div className={cn(
        "relative w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl overflow-hidden",
        "animate-in fade-in zoom-in-95 duration-300",
        isAnimating && "opacity-50 scale-95 transition-all duration-150"
      )}>
        {/* Progress Bar */}
        <div className="h-1 bg-[#222]">
          <div 
            className="h-full bg-[#CDB49E] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[#666] hover:text-white hover:bg-[#333] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#CDB49E]/20 to-[#CDB49E]/5 flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-[#CDB49E]" />
          </div>

          {/* Step Counter */}
          <div className="text-xs text-[#666] mb-2">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-white mb-3">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-[#888] text-sm leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Step Dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  idx === currentStep 
                    ? "w-6 bg-[#CDB49E]" 
                    : idx < currentStep 
                      ? "bg-[#CDB49E]/50" 
                      : "bg-[#333]"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3">
            {!isFirst && (
              <button
                onClick={goPrev}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#888] hover:text-white hover:bg-[#333] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            
            <button
              onClick={goNext}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all",
                isLast 
                  ? "bg-[#CDB49E] text-black hover:bg-[#d4c0ad]" 
                  : "bg-[#CDB49E]/10 text-[#CDB49E] hover:bg-[#CDB49E]/20"
              )}
            >
              {isLast ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip Link */}
        {!isLast && (
          <div className="px-8 pb-6 text-center">
            <button
              onClick={onClose}
              className="text-xs text-[#555] hover:text-[#888] transition-colors"
            >
              Skip tour
            </button>
          </div>
        )}
      </div>

      {/* Global styles for tour highlighting */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 101;
          box-shadow: 0 0 0 4px rgba(205, 180, 158, 0.3), 0 0 20px rgba(205, 180, 158, 0.2);
          border-radius: 8px;
          animation: tour-pulse 2s ease-in-out infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(205, 180, 158, 0.3), 0 0 20px rgba(205, 180, 158, 0.2); }
          50% { box-shadow: 0 0 0 8px rgba(205, 180, 158, 0.2), 0 0 30px rgba(205, 180, 158, 0.3); }
        }
      `}</style>
    </div>
  );
}

// Hook to check if tour should show
export function useOnboardingTour() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("atlas-onboarding-complete");
    if (!completed) {
      // Delay showing tour so the page loads first
      const timer = setTimeout(() => setShouldShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem("atlas-onboarding-complete");
    setShouldShow(true);
  }, []);

  return { shouldShow, setShouldShow, resetTour };
}
