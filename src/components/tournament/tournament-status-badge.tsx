import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground" },
  REGISTRATION_OPEN: { label: "Registration Open", className: "bg-primary/20 text-primary" },
  REGISTRATION_CLOSED: { label: "Registration Closed", className: "bg-yellow-500/20 text-yellow-500" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-500/20 text-blue-500" },
  COMPLETED: { label: "Completed", className: "bg-green-500/20 text-green-500" },
  CANCELLED: { label: "Cancelled", className: "bg-destructive/20 text-destructive" },
};

export function TournamentStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    label: status,
    className: "",
  };

  return (
    <Badge variant="outline" className={cn("border-0", config.className)}>
      {config.label}
    </Badge>
  );
}
