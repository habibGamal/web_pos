import { cn } from "@/lib/utils";

interface ApplicationLogoProps {
  className?: string;
}

export default function ApplicationLogo({ className }: ApplicationLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {/* Replace with actual logo */}
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">WP</span>
      </div>
      <span className="ml-2 font-semibold text-lg">Web POS</span>
    </div>
  );
}