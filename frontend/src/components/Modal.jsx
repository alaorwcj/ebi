import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Modal({ open, title, description, children, onClose, contentClassName }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={`${contentClassName || "sm:max-w-[420px]"} glass !border-white/10 !bg-[#09090b]/90 !shadow-2xl`}>
        <DialogHeader className="border-b border-white/5 pb-4">
          <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {description || title}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
