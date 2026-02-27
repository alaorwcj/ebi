import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConfirmModal({ open, title, description, onConfirm, onClose }) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="glass !border-white/10 !bg-[#09090b]/95 !shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-extrabold text-white tracking-tight">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400 font-medium">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-4 border-t border-white/5 mt-2">
          <AlertDialogCancel onClick={onClose} className="button secondary">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="gradient-button h-auto py-2.5">
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
