import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TimelineSession {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "completed" | "current" | "upcoming";
}

interface SessionTimelineProps {
  sessions: TimelineSession[];
  className?: string;
}

const SessionTimeline = ({ sessions, className }: SessionTimelineProps) => {
  const getStatusIcon = (status: TimelineSession["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-primary-foreground" />;
      case "current":
        return <Clock className="h-5 w-5 text-primary-foreground" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getIconBackground = (status: TimelineSession["status"]) => {
    switch (status) {
      case "completed":
      case "current":
        return "bg-primary";
      default:
        return "bg-muted border-2 border-border";
    }
  };

  return (
    <div className={cn("bg-card rounded-lg border border-border p-6 shadow-sm", className)}>
      <div className="space-y-0">
        {sessions.map((session, index) => (
          <div key={session.id} className="relative flex gap-4">
            {/* Timeline line */}
            {index !== sessions.length - 1 && (
              <div
                className={cn(
                  "absolute left-[17px] top-10 w-0.5 h-[calc(100%-16px)]",
                  session.status === "completed" || session.status === "current"
                    ? "bg-primary"
                    : "bg-border"
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0",
                getIconBackground(session.status)
              )}
            >
              {getStatusIcon(session.status)}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{session.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{session.description}</p>
                  {session.status === "current" && (
                    <Badge variant="default" className="mt-2 text-xs">
                      Prochaine séance
                    </Badge>
                  )}
                </div>
                <Badge
                  variant={session.status === "completed" || session.status === "current" ? "secondary" : "outline"}
                  className="shrink-0 ml-4 font-normal"
                >
                  {session.date}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionTimeline;
