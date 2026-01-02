type LoadingOverlayProps = {
  message?: string;
};

export function LoadingOverlay({ message = "Запазване на днешните данни..." }: LoadingOverlayProps) {
  return (
    <div className="bg-background/80 fixed inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
