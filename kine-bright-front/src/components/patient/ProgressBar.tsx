import { cn } from "@/lib/utils";
import * as React from "react";

interface ProgressBarProps {
  value: number;
  className?: string;
  variant?: "blue" | "green" | "orange";
  size?: "sm" | "md" | "lg";
}

const ProgressBar = ({ value, className, variant = "blue", size = "md" }: ProgressBarProps) => {
  const variantColors = {
    blue: "bg-primary",
    green: "bg-green-500",
    orange: "bg-orange-500",
  };

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size], className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000 ease-out",
          variantColors[variant]
        )}
        style={{ width: `${value}%`, "--progress-value": `${value}%` } as React.CSSProperties}
      />
    </div>
  );
};

export default ProgressBar;
