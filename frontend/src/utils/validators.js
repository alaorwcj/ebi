export function validateRequired(value) {
  return value ? "" : "Campo obrigatorio";
}

export function validateEmail(value) {
  if (!value) return "Campo obrigatorio";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) return "Email invalido";
  return "";
}

export function validatePassword(value) {
  if (!value || value.length < 8) return "Minimo 8 caracteres";
  return "";
}

export function validatePhone(value) {
  if (!value) return "Campo obrigatorio";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return "Telefone invalido";
  return "";
}
