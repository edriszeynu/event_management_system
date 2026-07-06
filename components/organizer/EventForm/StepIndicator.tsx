import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: { id: string; label: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <span className={cn(
              "text-sm font-medium",
              index <= currentStep ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "w-12 h-0.5 mx-2",
              index < currentStep ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
