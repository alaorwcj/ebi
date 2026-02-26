import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

export default function FormField({ label, error, required, id, icon, labelProps = {}, inputProps = {}, ...props }) {
  const fieldId = id || `field-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="space-y-2 flex flex-col" style={{ marginBottom: "16px" }}>
      {label && (
        <Label
          htmlFor={fieldId}
          className={`label !text-white !opacity-100 !font-bold ${error ? "text-destructive" : ""}`}
          {...labelProps}
        >
          {label}
          {required && <span className="text-destructive" aria-hidden="true"> *</span>}
        </Label>
      )}

      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 group-focus-within:text-white transition-colors pointer-events-none z-20">
            {icon}
          </div>
        )}
        <Input
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={`input !text-white !bg-white/10 !border-white/20 !placeholder-white/40 ${icon ? "pl-12" : ""} ${error ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
          {...inputProps}
          {...props}
        />
      </div>

      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-destructive mt-1 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
