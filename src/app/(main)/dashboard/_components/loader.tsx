export interface LoaderProps {
  text?: string;
}

export function Loader({ text = "Loading..." }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative h-16 w-16">
        <div className="border-t-primary border-r-primary/50 absolute inset-0 animate-spin rounded-full border-2 border-transparent" />

        <div
          className="border-b-primary/60 absolute inset-2 animate-spin rounded-full border-2 border-transparent"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />

        <div className="bg-primary/75 absolute inset-5 animate-pulse rounded-full" />
      </div>

      <p className="text-muted-foreground animate-pulse text-sm">{text}</p>
    </div>
  );
}
