import { Card, CardContent, CardHeader } from "@/components/ui/card";

type TaskSummaryProps = {
  label: string;
  value: number;
  accentClassName: string;
  delay?: string;
};

export function TaskSummary({ label, value, accentClassName, delay }: TaskSummaryProps) {
  return (
    <Card className="animate-enter overflow-hidden" style={delay ? { animationDelay: delay } : undefined}>
      <CardHeader className="pb-2">
        <div className={`h-1.5 w-16 rounded-full ${accentClassName}`} />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="display-font text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
