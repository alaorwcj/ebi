import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/pt-br";
import * as Popover from "@radix-ui/react-popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

dayjs.extend(customParseFormat);
dayjs.locale("pt-br");

const FORMATO = "DD/MM/YYYY";
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Filtra o input para aceitar apenas dígitos e barras no formato DD/MM/AAAA */
function filtrarInputData(valor) {
  const digits = valor.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export default function DatePicker({ label, value, onChange, id, className, error, minDate, maxDate }) {
  const fieldId = id || `date-${Math.random().toString(36).slice(2, 9)}`;
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const selectedDate = value && dayjs(value, "YYYY-MM-DD").isValid() ? dayjs(value) : null;
  const [viewDate, setViewDate] = useState(() => selectedDate || dayjs());

  useEffect(() => {
    if (!value) {
      setInputValue("");
      return;
    }
    const d = dayjs(value, "YYYY-MM-DD");
    setInputValue(d.isValid() ? d.format(FORMATO) : "");
  }, [value]);

  const min = minDate ? dayjs(minDate) : null;
  const max = maxDate ? dayjs(maxDate) : null;

  const handleSelect = useCallback(
    (date) => {
      const iso = date.format("YYYY-MM-DD");
      onChange?.({ target: { value: iso } });
      setInputValue(date.format(FORMATO));
      setOpen(false);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e) => {
      const raw = e.target.value;
      const filtrado = filtrarInputData(raw);
      setInputValue(filtrado);
      if (filtrado.length === 10) {
        const d = dayjs(filtrado, FORMATO);
        if (d.isValid()) {
          const iso = d.format("YYYY-MM-DD");
          if (min && d.isBefore(min, "day")) return;
          if (max && d.isAfter(max, "day")) return;
          onChange?.({ target: { value: iso } });
        }
      } else if (!filtrado) {
        onChange?.({ target: { value: "" } });
      }
    },
    [onChange, min, max]
  );

  const handleToday = useCallback(() => {
    const today = dayjs();
    if (min && today.isBefore(min, "day")) return;
    if (max && today.isAfter(max, "day")) return;
    handleSelect(today);
  }, [handleSelect, min, max]);

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange?.({ target: { value: "" } });
    setOpen(false);
  }, [onChange]);

  const startOfMonth = viewDate.startOf("month");
  const startBlank = startOfMonth.day();
  const daysInMonth = viewDate.daysInMonth();
  const days = [];
  for (let i = 0; i < startBlank; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(startOfMonth.date(i));

  const isDayDisabled = (d) => {
    if (min && d.isBefore(min, "day")) return true;
    if (max && d.isAfter(max, "day")) return true;
    return false;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
          {label}
        </Label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
        <Popover.Trigger asChild>
          <input
            id={fieldId}
            type="text"
            placeholder="DD/MM/AAAA"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            readOnly={false}
            maxLength={10}
            inputMode="numeric"
            className={cn(
              "flex h-10 w-full rounded-xl border px-4 py-2 text-base transition-colors",
              "border-input bg-transparent shadow-xs",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
              "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
              "disabled:pointer-events-none disabled:opacity-50",
              "placeholder:text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive/20"
            )}
            style={{
              background: "var(--panel)",
              color: "var(--text)",
              borderColor: "var(--border)"
            }}
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="p-0 w-auto z-[100]"
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            style={{
              background: "var(--panel)",
              color: "var(--text)",
              border: "2px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "0 10px 30px var(--shadow)",
              zIndex: 100
            }}
          >
            <div className="pt-3 px-3">
              <div className="flex justify-between items-center mb-3">
                <button
                  type="button"
                  onClick={() => setViewDate((d) => d.subtract(1, "month"))}
                  className="h-7 w-7 rounded p-0 hover:bg-black/10 flex items-center justify-center"
                  style={{ color: "var(--text)" }}
                  aria-label="Mês anterior"
                >
                  ‹
                </button>
                <span className="font-semibold capitalize" style={{ color: "var(--text)" }}>
                  {viewDate.format("MMMM YYYY")}
                </span>
                <button
                  type="button"
                  onClick={() => setViewDate((d) => d.add(1, "month"))}
                  className="h-7 w-7 rounded p-0 hover:bg-black/10 flex items-center justify-center"
                  style={{ color: "var(--text)" }}
                  aria-label="Próximo mês"
                >
                  ›
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-2">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia} className="w-9 h-9 flex items-center justify-center text-sm text-muted-foreground">
                    {dia}
                  </div>
                ))}
                {days.map((d, i) => {
                  if (!d) return <div key={`empty-${i}`} className="w-9 h-9" />;
                  const isSelected = selectedDate && d.isSame(selectedDate, "day");
                  const isToday = d.isSame(dayjs(), "day");
                  const disabled = isDayDisabled(d);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !disabled && handleSelect(d)}
                      disabled={disabled}
                      className={cn(
                        "w-9 h-9 rounded text-sm",
                        isSelected && "text-white",
                        !isSelected && !disabled && "hover:bg-black/10",
                        disabled && "opacity-40 cursor-not-allowed"
                      )}
                      style={
                        isSelected
                          ? { background: "var(--accent)", color: "white" }
                          : { color: "var(--text)" }
                      }
                    >
                      {isToday ? <strong>{d.date()}</strong> : d.date()}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 p-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                className="text-sm px-3 py-1.5 rounded hover:bg-black/10"
                style={{ color: "var(--text)" }}
                onClick={handleToday}
              >
                Hoje
              </button>
              <button
                type="button"
                className="text-sm px-3 py-1.5 rounded hover:bg-black/10"
                style={{ color: "var(--text)" }}
                onClick={handleClear}
              >
                Limpar
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
