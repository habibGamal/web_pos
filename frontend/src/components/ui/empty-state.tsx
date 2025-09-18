import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-6",
      className
    )}>
      {icon && (
        <div className="text-muted-foreground mb-2">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}