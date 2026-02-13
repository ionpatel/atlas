"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseLazyImageOptions {
  rootMargin?: string;
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function useLazyImage(
  src: string,
  options: UseLazyImageOptions = {}
) {
  const { rootMargin = "200px", threshold = 0.1, onLoad, onError } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setError(true);
      onError?.();
    };
    img.src = src;
  }, [isInView, src, onLoad, onError]);

  return { imgRef, isLoaded, isInView, error };
}

// Lazy Image Component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
}

export function LazyImage({
  src,
  alt,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23111' width='400' height='300'/%3E%3C/svg%3E",
  blurDataURL,
  className,
  style,
  ...props
}: LazyImageProps) {
  const { imgRef, isLoaded, error } = useLazyImage(src);

  if (error) {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: "14px",
        }}
        role="img"
        aria-label={`Failed to load: ${alt}`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ marginRight: "8px" }}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
        Image unavailable
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={isLoaded ? src : placeholder}
      alt={alt}
      className={className}
      style={{
        ...style,
        transition: "opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
        opacity: isLoaded ? 1 : 0.6,
        filter: isLoaded ? "none" : "blur(4px)",
      }}
      loading="lazy"
      {...props}
    />
  );
}
