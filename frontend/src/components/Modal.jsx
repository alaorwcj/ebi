import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Modal({ open, title, children, onClose, contentClassName }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={`${contentClassName || "sm:max-w-[420px]"} glass !border-white/10 !bg-[#09090b]/90 !shadow-2xl`}>
        <DialogHeader className="border-b border-white/5 pb-4">
          <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
