// =============================================
// CONFIG.JS — Configurações globais da aplicação
// =============================================

const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  TOKEN_KEY: 'portal_token',
  USER_KEY: 'portal_user',
  DARK_MODE_KEY: 'darkMode',
  MOCK_MODE: false, // false = backend real, true = dados mock

  // Lista centralizada de departamentos
  // Para adicionar/remover um departamento, edite apenas aqui.
  DEPARTAMENTOS: [
    'Tecnologia da Informação',
    'Recursos Humanos',
    'Vendas',
    'Financeiro',
    'Marketing',
    'Operações',
    'Jurídico',
    'Administrativo',
  ],
};

/**
 * Popula um <select> com uma lista de departamentos.
 * @param {string} selectId - ID do elemento select
 * @param {string[]} departamentos - Array de strings com os departamentos
 * @param {string} [valorAtual] - Valor a pré-selecionar
 * @param {string} [placeholderText] - Texto do option vazio
 * @param {boolean} [incluirTodos] - Se true, adiciona opção 'Todos os departamentos'
 */
export function popularDepartamentos(selectId, departamentos = [], valorAtual = '', placeholderText = 'Selecione...', incluirTodos = false) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Fallback para a lista local se não chegarem dados do servidor
  const lista = departamentos.length > 0 ? departamentos : CONFIG.DEPARTAMENTOS;

  const opcaoVazia = incluirTodos
    ? `<option value="">Todos os departamentos</option>`
    : `<option value="">${placeholderText}</option>`;

  select.innerHTML = opcaoVazia + lista.map(dep =>
    `<option value="${dep}"${dep === valorAtual ? ' selected' : ''}>${dep}</option>`
  ).join('');
}

export default CONFIG;
