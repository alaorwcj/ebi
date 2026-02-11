import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FormField({ label, error, required, id, ...props }) {
  const fieldId = id || `field-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className="space-y-2" style={{ marginBottom: "12px" }}>
      <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
        {label}
        {required && <span className="text-destructive" aria-hidden="true"> *</span>}
      </Label>
      <Input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={error ? "border-destructive focus-visible:ring-destructive/20" : ""}
        {...props}
      />
      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
