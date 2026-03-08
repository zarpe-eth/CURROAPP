import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring-4",
        className,
      )}
      {...props}
    />
  );
}

