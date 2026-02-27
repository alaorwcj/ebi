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
    <div className={cn("space-y-2 flex flex-col", className)} style={{ marginBottom: "16px" }}>
      {label && (
        <Label htmlFor={fieldId} className={cn("label !text-white !opacity-100 !font-bold", error && "text-red-500")}>
          {label}
        </Label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors pointer-events-none z-20">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </div>
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
                "w-full bg-slate-900/50 border border-white/5 rounded-2xl py-6 pl-12 pr-6 focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600 text-slate-100 placeholder:font-normal font-medium",
                error && "border-red-500/10 focus:ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              )}
            />
          </Popover.Trigger>
        </div>
        <Popover.Portal>
          <Popover.Content
            className="p-0 w-auto z-[100] glass !bg-[#09090b]/95 !border-white/10 !shadow-2xl"
            align="start"
            sideOffset={8}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="pt-4 px-4">
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={() => setViewDate((d) => d.subtract(1, "month"))}
                  className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  aria-label="Mês anterior"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="font-extrabold text-sm text-white capitalize tracking-tight">
                  {viewDate.format("MMMM YYYY")}
                </span>
                <button
                  type="button"
                  onClick={() => setViewDate((d) => d.add(1, "month"))}
                  className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  aria-label="Próximo mês"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia} className="w-10 h-10 flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-slate-600">
                    {dia}
                  </div>
                ))}
                {days.map((d, i) => {
                  if (!d) return <div key={`empty-${i}`} className="w-10 h-10" />;
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
                        "w-10 h-10 rounded-xl text-xs font-bold transition-all",
                        isSelected && "bg-primary text-white shadow-lg shadow-primary/30",
                        !isSelected && !disabled && "hover:bg-white/10 text-slate-300",
                        isToday && !isSelected && "border border-primary/30 text-primary",
                        disabled && "opacity-20 cursor-not-allowed"
                      )}
                    >
                      {d.date()}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-white/5 bg-white/5">
              <button
                type="button"
                className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all flex-1"
                onClick={handleToday}
              >
                Hoje
              </button>
              <button
                type="button"
                className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-all flex-1"
                onClick={handleClear}
              >
                Limpar
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && (
        <p className="text-sm text-red-500 mt-1 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
