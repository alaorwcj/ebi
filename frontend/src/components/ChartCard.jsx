export default function ChartCard({ title, children }) {
  return (
    <div className="card rounded-2xl border border-border/50 shadow-xl">
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <div className="mt-4 min-h-[200px]">{children}</div>
    </div>
  );
}
