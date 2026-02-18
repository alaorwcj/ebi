export function validateRequired(value) {
  return value ? "" : "Campo obrigatório.";
}

export function validateEmail(value) {
  if (!value) return "Informe o email.";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) return "Email inválido.";
  return "";
}

export function validatePassword(value) {
  if (!value || value.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
  return "";
}

export function validatePhone(value) {
  if (!value) return "Informe o telefone.";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return "Telefone inválido.";
  return "";
}
