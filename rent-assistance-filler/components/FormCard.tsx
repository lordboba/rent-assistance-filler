"use client";

interface FormCardProps {
  title: string;
  description: string;
  status?: "available" | "in_progress" | "completed";
  onClick?: () => void;
}

export default function FormCard({ title, description, status = "available", onClick }: FormCardProps) {
  const statusColors = {
    available: "border-border hover:border-primary",
    in_progress: "border-yellow-400 bg-yellow-50",
    completed: "border-accent bg-green-50",
  };

  const statusLabels = {
    available: null,
    in_progress: "In Progress",
    completed: "Completed",
  };

  return (
    <button
      onClick={onClick}
      className={`card text-left w-full transition-all ${statusColors[status]} hover:shadow-md`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
        {statusLabels[status] && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              status === "in_progress"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {statusLabels[status]}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-secondary">{description}</p>
    </button>
  );
}
