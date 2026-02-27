import { Toaster } from "sonner";

export default function ThemedToaster() {
  // O sistema agora é forçado Dark por padrão conforme o Redesign Stitch
  return (
    <Toaster
      theme="dark"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        className: "glass !border-white/10 !bg-[#09090b]/90 !text-white !font-medium",
      }}
    />
  );
}
