export function validateRequired(value) {
  return value ? "" : "Campo obrigatorio";
}

export function validateEmail(value) {
  if (!value) return "Campo obrigatorio";
  if (!value.includes("@")) return "Email invalido";
  return "";
}

export function validatePassword(value) {
  if (!value || value.length < 8) return "Minimo 8 caracteres";
  return "";
}
