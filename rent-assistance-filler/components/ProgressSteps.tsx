"use client";

interface Step {
  id: number;
  name: string;
  status: "complete" | "current" | "upcoming";
}

interface ProgressStepsProps {
  steps: Step[];
}

export default function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center space-x-2 sm:space-x-4">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="flex items-center">
            {step.status === "complete" ? (
              <span className="flex items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                  <svg
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="ml-2 text-sm font-medium text-accent hidden sm:block">
                  {step.name}
                </span>
              </span>
            ) : step.status === "current" ? (
              <span className="flex items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary">
                  <span className="text-white text-sm font-semibold">{step.id}</span>
                </span>
                <span className="ml-2 text-sm font-medium text-primary hidden sm:block">
                  {step.name}
                </span>
              </span>
            ) : (
              <span className="flex items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border">
                  <span className="text-secondary text-sm">{step.id}</span>
                </span>
                <span className="ml-2 text-sm font-medium text-secondary hidden sm:block">
                  {step.name}
                </span>
              </span>
            )}
            {stepIdx !== steps.length - 1 && (
              <div className="ml-2 sm:ml-4 h-0.5 w-8 sm:w-12 bg-border" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
