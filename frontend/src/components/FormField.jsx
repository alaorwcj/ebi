export default function FormField({ label, ...props }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label className="label">{label}</label>
      <input className="input" {...props} />
    </div>
  );
}
