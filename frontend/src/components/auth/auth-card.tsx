'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AuthCardProps {
  /** Icon component to display in the header */
  icon: LucideIcon;
  /** Card title text */
  title: string;
  /** Optional card description text or ReactNode */
  description?: ReactNode;
  /** Card content */
  children: ReactNode;
  /** Optional icon container styles for different states (success, error, etc.) */
  iconContainerClassName?: string;
  /** Optional additional card classes */
  className?: string;
}

/**
 * Reusable authentication card component with consistent styling
 * Provides standard layout for all auth forms with icon, title, description, and content
 */
export function AuthCard({
  icon: Icon,
  title,
  description,
  children,
  iconContainerClassName = 'bg-primary',
  className = '',
}: AuthCardProps) {
  return (
    <Card className={`w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl ${className}`}>
      <CardHeader className="space-y-1 text-center">
        <div className={`mx-auto h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${iconContainerClassName}`}>
          <Icon className="w-8 h-8 text-primary-foreground" aria-hidden="true" />
        </div>
        <CardTitle className="text-3xl font-extrabold text-gray-900">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Specialized AuthCard for success states
 */
export function AuthSuccessCard({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}: Omit<AuthCardProps, 'iconContainerClassName'>) {
  return (
    <AuthCard
      icon={Icon}
      title={title}
      description={description}
      iconContainerClassName="bg-green-100"
      className={className}
    >
      {children}
    </AuthCard>
  );
}

/**
 * Specialized AuthCard for error states
 */  
export function AuthErrorCard({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}: Omit<AuthCardProps, 'iconContainerClassName'>) {
  return (
    <AuthCard
      icon={Icon}
      title={title}
      description={description}
      iconContainerClassName="bg-red-100"
      className={className}
    >
      {children}
    </AuthCard>
  );
}

/**
 * Large icon variant for success/error states with 16x16 icon
 */
export function AuthStatusCard({
  icon: Icon,
  title,
  description,
  children,
  status = 'default',
  className = '',
}: Omit<AuthCardProps, 'iconContainerClassName'> & {
  status?: 'default' | 'success' | 'error';
}) {
  const getIconStyles = () => {
    switch (status) {
      case 'success':
        return {
          containerClass: 'bg-green-100',
          iconClass: 'text-green-600',
        };
      case 'error':
        return {
          containerClass: 'bg-red-100',
          iconClass: 'text-red-600',
        };
      default:
        return {
          containerClass: 'bg-primary/10',
          iconClass: 'text-primary',
        };
    }
  };

  const { containerClass, iconClass } = getIconStyles();

  return (
    <Card className={`w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl ${className}`}>
      <CardHeader className="space-y-1 text-center">
        <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${containerClass}`}>
          <Icon className={`w-8 h-8 ${iconClass}`} aria-hidden="true" />
        </div>
        <CardTitle className="text-3xl font-extrabold text-gray-900">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}