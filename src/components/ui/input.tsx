import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border/90 bg-white px-3 text-sm text-foreground outline-none ring-primary/20 placeholder:text-muted-foreground transition focus:border-primary/40 focus:ring-4",
        className,
      )}
      {...props}
    />
  );
}
