"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
  direction: "left" | "right" | "up" | "down" | null;
}

interface UseSwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

/**
 * Handle swipe gestures for mobile
 */
export function useSwipe(options: UseSwipeOptions = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = options;

  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
    direction: null,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isSwiping: true,
      direction: null,
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchState((prev) => {
      const deltaX = touch.clientX - prev.startX;
      const deltaY = touch.clientY - prev.startY;
      
      let direction: TouchState["direction"] = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      return {
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX,
        deltaY,
        direction,
      };
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTouchState((prev) => {
      if (Math.abs(prev.deltaX) >= threshold) {
        if (prev.deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
      if (Math.abs(prev.deltaY) >= threshold) {
        if (prev.deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }

      return {
        ...prev,
        isSwiping: false,
      };
    });
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    touchState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

/**
 * Long press detection for mobile context menus
 */
export function useLongPress(
  callback: () => void,
  options: { delay?: number; onStart?: () => void; onCancel?: () => void } = {}
) {
  const { delay = 500, onStart, onCancel } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPressed = useRef(false);

  const start = useCallback(() => {
    isPressed.current = true;
    onStart?.();
    
    timeoutRef.current = setTimeout(() => {
      if (isPressed.current) {
        callback();
      }
    }, delay);
  }, [callback, delay, onStart]);

  const cancel = useCallback(() => {
    isPressed.current = false;
    onCancel?.();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [onCancel]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };
}

/**
 * Pinch-to-zoom gesture handling
 */
export function usePinchZoom(options: { minScale?: number; maxScale?: number } = {}) {
  const { minScale = 0.5, maxScale = 3 } = options;
  const [scale, setScale] = useState(1);
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef(1);

  const getDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches);
      initialScale.current = scale;
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance.current) {
      const currentDistance = getDistance(e.touches);
      const newScale = initialScale.current * (currentDistance / initialDistance.current);
      setScale(Math.min(maxScale, Math.max(minScale, newScale)));
    }
  }, [minScale, maxScale]);

  const handleTouchEnd = useCallback(() => {
    initialDistance.current = null;
  }, []);

  const resetScale = useCallback(() => {
    setScale(1);
  }, []);

  return {
    scale,
    setScale,
    resetScale,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

/**
 * Touch-friendly drag and drop
 */
export function useTouchDrag(
  onDragEnd: (startIndex: number, endIndex: number) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const elementRefs = useRef<Map<number, HTMLElement>>(new Map());

  const registerElement = useCallback((index: number, element: HTMLElement | null) => {
    if (element) {
      elementRefs.current.set(index, element);
    } else {
      elementRefs.current.delete(index);
    }
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setIsDragging(true);
    setDragIndex(index);
  }, []);

  const handleDragMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || dragIndex === null) return;

    const touch = e.touches[0];
    const elements = Array.from(elementRefs.current.entries());
    
    for (const [index, element] of elements) {
      const rect = element.getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        setHoverIndex(index);
        break;
      }
    }
  }, [isDragging, dragIndex]);

  const handleDragEnd = useCallback(() => {
    if (dragIndex !== null && hoverIndex !== null && dragIndex !== hoverIndex) {
      onDragEnd(dragIndex, hoverIndex);
    }
    setIsDragging(false);
    setDragIndex(null);
    setHoverIndex(null);
  }, [dragIndex, hoverIndex, onDragEnd]);

  return {
    isDragging,
    dragIndex,
    hoverIndex,
    registerElement,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}

/**
 * Detect if device supports touch
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - msMaxTouchPoints is IE specific
      navigator.msMaxTouchPoints > 0
    );
  }, []);

  return isTouch;
}

/**
 * Prevent scroll when interacting with element
 */
export function usePreventScroll(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isActive]);
}
