'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { FieldError, UseFormRegister } from 'react-hook-form';

interface BaseFormFieldProps {
  label: string;
  error?: FieldError;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface InputFormFieldProps extends BaseFormFieldProps {
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  autoComplete?: string;
  register: UseFormRegister<any>;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface CheckboxFormFieldProps extends BaseFormFieldProps {
  name: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: React.ReactNode;
}

/**
 * Reusable form field component for input fields
 * Handles label, input, and error display consistently
 */
export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  register,
  error,
  required = false,
  className = '',
  onFocus,
  onBlur,
  children,
}: InputFormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        {...register(name)}
        id={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        className={error ? 'border-red-300 focus-visible:ring-red-200' : ''}
      />
      {children}
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}

/**
 * Reusable checkbox form field component
 */
export function CheckboxFormField({
  name,
  label,
  checked,
  onCheckedChange,
  error,
  description,
  className = '',
}: CheckboxFormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <Label htmlFor={name} className="text-sm text-gray-900">
          {label}
        </Label>
      </div>
      {description && <div className="text-sm text-gray-600 ml-6">{description}</div>}
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}

/**
 * Simple form field wrapper for custom field types
 */
export function CustomFormField({
  label,
  error,
  required = false,
  className = '',
  children,
}: BaseFormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}