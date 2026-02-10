export default function ChartCard({ title, children }) {
  return (
    <div className="card">
      <strong>{title}</strong>
      <div style={{ marginTop: "12px" }}>{children}</div>
    </div>
  );
}
