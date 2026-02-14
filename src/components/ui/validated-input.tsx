'use client';

import { forwardRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  showValidIcon?: boolean;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ label, error, hint, showValidIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    const hasError = !!error;
    const isValid = showValidIcon && props.value && !hasError;

    return (
      <div className="space-y-1.5">
        {label && (
          <Label 
            htmlFor={inputId} 
            className={cn(
              "text-sm font-medium",
              hasError ? "text-red-400" : "text-white"
            )}
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            className={cn(
              "bg-neutral-800 border-neutral-700 text-white transition-colors",
              hasError && "border-red-500 focus-visible:ring-red-500",
              isValid && "border-green-500 pr-10",
              className
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {isValid && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          {hasError && !isValid && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
          )}
        </div>
        {hasError && (
          <p id={`${inputId}-error`} className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {hint && !hasError && (
          <p id={`${inputId}-hint`} className="text-xs text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

// Validated Select
interface ValidatedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const ValidatedSelect = forwardRef<HTMLSelectElement, ValidatedSelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-');
    const hasError = !!error;

    return (
      <div className="space-y-1.5">
        {label && (
          <Label 
            htmlFor={selectId} 
            className={cn(
              "text-sm font-medium",
              hasError ? "text-red-400" : "text-white"
            )}
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </Label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full h-10 px-3 rounded-md bg-neutral-800 border border-neutral-700 text-white text-sm",
            "focus:outline-none focus:ring-2 focus:ring-[#273B3A] focus:border-transparent",
            hasError && "border-red-500 focus:ring-red-500",
            className
          )}
          aria-invalid={hasError}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasError && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

ValidatedSelect.displayName = 'ValidatedSelect';

// Validated Textarea
interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({ label, error, maxLength, showCount, className, id, value, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');
    const hasError = !!error;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <Label 
              htmlFor={textareaId} 
              className={cn(
                "text-sm font-medium",
                hasError ? "text-red-400" : "text-white"
              )}
            >
              {label}
              {props.required && <span className="text-red-400 ml-1">*</span>}
            </Label>
            {showCount && maxLength && (
              <span className={cn(
                "text-xs",
                charCount > maxLength ? "text-red-400" : "text-neutral-500"
              )}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          className={cn(
            "w-full min-h-[100px] px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-white text-sm resize-y",
            "focus:outline-none focus:ring-2 focus:ring-[#273B3A] focus:border-transparent",
            hasError && "border-red-500 focus:ring-red-500",
            className
          )}
          maxLength={maxLength}
          aria-invalid={hasError}
          {...props}
        />
        {hasError && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

ValidatedTextarea.displayName = 'ValidatedTextarea';
