import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

export default function FormField({ label, error, required, id, icon, children, labelProps = {}, inputProps = {}, ...props }) {
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
        {children ? (
          children
        ) : (
          <Input
            id={fieldId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            className={`w-full bg-slate-900/50 border border-white/5 rounded-2xl py-6 ${icon ? "pl-12" : "pl-6"} pr-6 focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600 text-slate-100 placeholder:font-normal font-medium ${error ? "border-red-500/10 focus:ring-red-500/20" : ""}`}
            {...inputProps}
            {...props}
          />
        )}
      </div>

      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-destructive mt-1 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

