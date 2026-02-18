/**
 * Tipos do menu da sidebar (estilo WPay).
 * Itens sem subItems são links diretos; itens com subItems expandem submenu.
 */

/** @typedef {{ label: string; icon: string; path: string }} SubMenuItem */

/**
 * @typedef {Object} MenuItem
 * @property {string} label
 * @property {string} icon - nome do ícone lucide (ex: 'Home', 'Users')
 * @property {string} path - rota (usado quando não tem subItems)
 * @property {SubMenuItem[]} [subItems]
 */

export default {};
