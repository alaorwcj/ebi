import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Modal({ open, title, children, onClose, contentClassName }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={contentClassName || "sm:max-w-[420px]"}>
        <DialogHeader className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
          <DialogTitle className="text-xl font-semibold" style={{ color: "var(--text)" }}>
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4 max-h-[65vh] overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
