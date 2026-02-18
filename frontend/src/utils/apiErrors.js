/**
 * Mapeia mensagens técnicas da API para mensagens amigáveis ao usuário.
 * Nunca expõe códigos HTTP (404, 403) ou termos técnicos (Forbidden, Not Found).
 */

const MESSAGENS_TECNICAS = {
  // Autenticação e autorização
  Forbidden: "Você não tem permissão para esta ação.",
  Unauthorized: "Sessão expirada. Faça login novamente.",
  "Invalid token": "Sessão expirada. Faça login novamente.",
  "Invalid credentials": "Email ou senha incorretos.",

  // User not found: em 401/403 = sessão; em 404 = usuário
  "User not found": "Usuário não encontrado.",

  // Usuários
  "Email already in use": "Este email já está cadastrado.",

  // Crianças
  "Child not found": "Criança não encontrada.",
  "Guardians required": "Informe ao menos um responsável.",

  // EBI
  "EBI not found": "EBI não encontrado.",
  "EBI closed": "Este EBI já foi encerrado.",
  "Coordinator not found": "Coordenadora não encontrada.",
  "Invalid coordinator role": "Usuário selecionado não é coordenadora.",
  "Invalid collaborator": "Colaboradora inválida.",
  "Invalid collaborator role": "Usuário selecionado não é colaboradora.",

  // Presença
  "Presence not found": "Presença não encontrada.",
  "Presence already exists": "Esta presença já foi registrada.",
  "Invalid pin": "PIN incorreto.",
  "Already checked out": "Saída já registrada.",
  "All presences must be closed":
    "Todas as presenças precisam ter saída registrada antes de encerrar.",

  // Genéricos
  "Not Found": "Registro não encontrado.",
  "Not found": "Registro não encontrado.",
  "Validation error": "Dados inválidos. Verifique os campos e tente novamente.",
  "Invalid request payload": "Dados inválidos. Verifique os campos e tente novamente.",
  "Unknown error": "Ocorreu um erro. Tente novamente mais tarde.",
  "Request failed": "Ocorreu um erro. Tente novamente mais tarde.",

  // Bootstrap/Auth
  "Bootstrap disabled": "Cadastro inicial desabilitado.",
  "Users already exist": "Sistema já inicializado."
};

const MENSAGENS_POR_STATUS = {
  400: "Dados inválidos. Verifique as informações e tente novamente.",
  401: "Sessão expirada. Faça login novamente.",
  403: "Você não tem permissão para esta ação.",
  404: "Registro não encontrado.",
  409: "Esta operação não pode ser realizada. Os dados podem estar em conflito.",
  422: "Dados inválidos. Verifique os campos do formulário.",
  500: "Erro interno. Tente novamente mais tarde."
};

/**
 * Extrai mensagem amigável do payload de erro da API.
 * @param {object} payload - Corpo da resposta de erro (pode ter detail como string ou array)
 * @param {number} status - Código HTTP de status
 * @returns {string} Mensagem amigável para exibir ao usuário
 */
export function mensagemErroAmigavel(payload, status) {
  let raw = null;

  if (payload?.detail) {
    if (Array.isArray(payload.detail)) {
      raw = payload.detail.map((e) => e.msg || e.message || String(e)).join(". ");
    } else {
      raw = String(payload.detail).trim();
    }
  } else if (payload?.message) {
    raw = String(payload.message).trim();
  } else if (payload?.title) {
    raw = String(payload.title).trim();
  }

  if ((status === 401 || status === 403) && (raw === "User not found" || raw === "Invalid token")) {
    return "Sessão expirada. Faça login novamente.";
  }

  if (raw && MESSAGENS_TECNICAS[raw]) {
    return MESSAGENS_TECNICAS[raw];
  }

  const mensagemPadrao = MENSAGENS_POR_STATUS[status] || "Ocorreu um erro. Tente novamente mais tarde.";

  if (!raw) return mensagemPadrao;

  if (/^(forbidden|not found|unauthorized|internal server error|bad request|[\d]{3})$/i.test(raw)) {
    return mensagemPadrao;
  }

  if (raw.length < 100 && !raw.startsWith("{")) {
    return raw;
  }

  return mensagemPadrao;
}

const TERMOS_TECNICOS = /^(forbidden|not found|unauthorized|internal server error|bad request|[\d]{3}|network error|failed to fetch)$/i;
const ERRO_JS = /^(cannot|unexpected|undefined|null|is not a function|syntaxerror)/i;

/**
 * Garante que a mensagem exibida ao usuário nunca seja técnica.
 * @param {Error} err - Erro capturado
 * @param {string} fallback - Mensagem padrão se err for técnico
 * @returns {string}
 */
export function mensagemParaUsuario(err, fallback = "Ocorreu um erro. Tente novamente.") {
  const msg = err?.message?.trim?.();
  if (!msg) return fallback;
  if (TERMOS_TECNICOS.test(msg)) return fallback;
  if (ERRO_JS.test(msg)) return fallback;
  if (msg.length > 150) return fallback;
  return msg;
}
