export default function ChartCard({ title, children }) {
  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
      </div>
      <div className="h-[240px]">
        {children}
      </div>
    </div>
  );
}
