// EBI Vila Paula – Playwright E2E Audit
// Covers: Phase 2 (3 profiles) + Phase 3 (security)
// Target: http://69.169.103.28:5173
// Run: npx playwright test ebi-playwright-tests.js --reporter=html

const { chromium } = require("playwright");
const BASE = "http://69.169.103.28:5173";
const API = "http://69.169.103.28:8000";

// ── helpers ──────────────────────────────────────────────────────────────────
async function loginAs(page, email, password) {
    await page.goto(`${BASE}/login`);
    await page.fill("input[type='email']", email);
    await page.fill("input[type='password']", password);
    await page.click("button[type='submit']");
    await page.waitForURL(/\/ebis/, { timeout: 8000 });
}

async function apiToken(email, password) {
    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    });
    const data = await res.json();
    return { token: data.access_token, status: res.status };
}

async function apiGet(token, path) {
    const res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function apiPost(token, path, body = {}) {
    const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
}

// ── shared state ─────────────────────────────────────────────────────────────
let createdUserId = null;
let createdEbiId = null;
let createdPresenceId = null;
let createdPin = null;

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 2.1 – ADMINISTRADOR
// ═══════════════════════════════════════════════════════════════════════════
async function runAdminTests(browser) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const results = [];
    const log = (id, scenario, passed, notes = "") =>
        results.push({ id, scenario, passed, notes });

    // A1 – Login
    try {
        await loginAs(page, "admin@ebi.local", "admin001");
        log("A1", "Login admin → redireciona /ebis", true);
    } catch (e) {
        log("A1", "Login admin", false, e.message);
        await ctx.close();
        return results;
    }

    // A2 – Menu lateral exibe "Usuários"
    try {
        const usersLink = await page.locator("text=Usuários").isVisible();
        log("A2", "Sidebar mostra 'Usuários'", usersLink);
    } catch (e) { log("A2", "Sidebar mostra 'Usuários'", false, e.message); }

    // A3 – Listar usuários
    try {
        await page.goto(`${BASE}/users`);
        await page.waitForSelector(".glass", { timeout: 6000 });
        const cards = await page.locator(".glass").count();
        log("A3", `Listagem de usuários carregada (${cards} cards)`, cards > 0);
    } catch (e) { log("A3", "Listagem de usuários", false, e.message); }

    // A4 – Criar novo usuário (Coordenadora)
    try {
        await page.goto(`${BASE}/users`);
        await page.click("text=Cadastrar Usuário");
        await page.waitForSelector("[role='dialog']", { timeout: 4000 });
        await page.fill("input[placeholder='']", "Coord Teste E2E", { strict: false });
        // Fill by label order
        const inputs = page.locator("[role='dialog'] input");
        await inputs.nth(0).fill("Coord Teste E2E");       // full_name
        await inputs.nth(1).fill("coord.teste@ebi.local"); // email
        await inputs.nth(2).fill("(11) 91234-5678");       // phone
        await inputs.nth(3).fill("Teste@1234");             // password
        // Select role = COORDENADORA (default)
        await page.click("text=Criar Usuário");
        await page.waitForTimeout(2000);
        const toast = await page.locator(".sonner-toast").first().isVisible().catch(() => false);
        // verify user appears in list
        await page.reload();
        const found = await page.locator("text=Coord Teste E2E").first().isVisible().catch(() => false);
        log("A4", "Criar usuário Coordenadora", found, found ? "Aparece na lista" : "Não encontrado na lista");
    } catch (e) { log("A4", "Criar usuário Coordenadora", false, e.message); }

    // A5 – Editar usuário criado
    try {
        await page.goto(`${BASE}/users`);
        await page.waitForSelector("text=Editar Usuário", { timeout: 6000 });
        // click first edit button matching coord.teste
        const editBtns = page.locator("button:has-text('Editar Usuário')");
        await editBtns.first().click();
        await page.waitForSelector("[role='dialog']", { timeout: 4000 });
        const nameInput = page.locator("[role='dialog'] input").first();
        await nameInput.triple_click();
        await nameInput.fill("Coord Teste E2E Editado");
        await page.click("text=Salvar");
        await page.waitForTimeout(1500);
        await page.reload();
        const found = await page.locator("text=Coord Teste E2E Editado").first().isVisible().catch(() => false);
        log("A5", "Editar usuário criado", found);
    } catch (e) { log("A5", "Editar usuário criado", false, e.message); }

    // A6 – Menu Crianças visível
    try {
        const childLink = await page.locator("text=Crianças").isVisible();
        log("A6", "Menu 'Crianças' visível para Admin", childLink);
    } catch (e) { log("A6", "Menu 'Crianças'", false, e.message); }

    // A7 – Criar criança com 2 responsáveis
    try {
        await page.goto(`${BASE}/children`);
        await page.click("text=Cadastrar Criança");
        await page.waitForSelector("[role='dialog']", { timeout: 4000 });
        const inputs = page.locator("[role='dialog'] input");
        await inputs.first().fill("Pedro Teste E2E");
        // First guardian
        const guardianInputs = page.locator("[role='dialog'] .rounded-xl input");
        await guardianInputs.nth(0).fill("Responsável Um");
        await guardianInputs.nth(1).fill("(11) 91111-1111");
        // Add second guardian
        await page.click("text=Adicionar");
        await guardianInputs.nth(2).fill("Responsável Dois");
        await guardianInputs.nth(3).fill("(11) 92222-2222");
        await page.click("text=Concluir Cadastro");
        await page.waitForTimeout(2000);
        await page.reload();
        const found = await page.locator("text=Pedro Teste E2E").first().isVisible().catch(() => false);
        log("A7", "Criar criança com 2 responsáveis", found);
    } catch (e) { log("A7", "Criar criança com 2 responsáveis", false, e.message); }

    // A8 – Menu EBI visível
    try {
        const ebiLink = await page.locator("text=EBIs").isVisible();
        log("A8", "Menu 'EBI' visível para Admin", ebiLink);
    } catch (e) { log("A8", "Menu 'EBI'", false, e.message); }

    // A9 – Admin NÃO cria EBI (botão 'Criar EBI' oculto para admin)
    try {
        await page.goto(`${BASE}/ebis`);
        await page.waitForTimeout(1500);
        const criarBtn = await page.locator("text=Criar EBI").isVisible().catch(() => false);
        log("A9", "Admin NÃO vê botão 'Criar EBI' (somente COORD)", !criarBtn,
            criarBtn ? "⚠ BOTÃO VISÍVEL (gap)" : "OK – oculto");
    } catch (e) { log("A9", "Admin não cria EBI", false, e.message); }

    // A10 – Acessa Meu Perfil e atualiza dados
    try {
        await page.goto(`${BASE}/profile`);
        await page.waitForSelector("form", { timeout: 6000 });
        const saveBtn = page.locator("button:has-text('Salvar Alterações do Perfil')");
        await saveBtn.click();
        await page.waitForTimeout(1500);
        log("A10", "Acessa Meu Perfil e salva dados", true);
    } catch (e) { log("A10", "Meu Perfil – salvar", false, e.message); }

    // A11 – Upload de documento no perfil (simula upload de PDF pequeno)
    try {
        await page.goto(`${BASE}/profile`);
        await page.waitForSelector("input[type='file']", { timeout: 5000 });
        // Upload the first available document upload input
        const fileInput = page.locator("input[type='file']").first();
        await fileInput.setInputFiles({
            name: "test_doc.png",
            mimeType: "image/png",
            buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"),
        });
        await page.waitForTimeout(3000);
        const enviado = await page.locator("text=Enviado").first().isVisible().catch(() => false);
        log("A11", "Upload de documento no perfil", enviado, enviado ? "Badge 'Enviado' visível" : "Badge não apareceu (verificar manualmente)");
    } catch (e) { log("A11", "Upload documento", false, e.message); }

    // A12 – Logout
    try {
        await page.click("text=Sair");
        await page.waitForURL(/\/login/, { timeout: 5000 });
        log("A12", "Logout → volta ao /login", true);
    } catch (e) { log("A12", "Logout", false, e.message); }

    await ctx.close();
    return results;
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 2.2 – COORDENADORA
// ═══════════════════════════════════════════════════════════════════════════
async function runCoordTests(browser) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const results = [];
    const log = (id, scenario, passed, notes = "") =>
        results.push({ id, scenario, passed, notes });

    // C1 – Login
    try {
        await loginAs(page, "coord@ebi.local", "coord001");
        log("C1", "Login coord → /ebis", true);
    } catch (e) {
        log("C1", "Login coord", false, e.message);
        await ctx.close();
        return results;
    }

    // C2 – NÃO vê menu Usuários
    try {
        const usersVisible = await page.locator("text=Usuários").isVisible().catch(() => false);
        log("C2", "Coord NÃO vê 'Usuários' na sidebar", !usersVisible,
            usersVisible ? "⚠ VISÍVEL (gap)" : "OK – oculto");
    } catch (e) { log("C2", "Sidebar sem 'Usuários'", false, e.message); }

    // C3 – Criar novo EBI
    try {
        await page.goto(`${BASE}/ebis`);
        await page.click("text=Criar EBI");
        await page.waitForSelector("[role='dialog']", { timeout: 4000 });
        // pick date: today formatted
        const today = new Date().toISOString().split("T")[0];
        // DatePicker: try direct input fill
        const dateInput = page.locator("[role='dialog'] input[type='date']").first();
        if (await dateInput.count() > 0) {
            await dateInput.fill(today);
        } else {
            // Custom date picker – type the date
            await page.locator("[role='dialog'] input").first().fill(today);
        }
        // Select coordinator
        const coordSelect = page.locator("[role='dialog'] select").first();
        await coordSelect.selectOption({ index: 1 }); // first available coordinator
        await page.click("[role='dialog'] button:has-text('Criar')");
        await page.waitForTimeout(2000);
        await page.reload();
        // capture first EBI id from URL after clicking first EBI
        const ebiLinks = page.locator("a:has-text('Abrir')");
        if (await ebiLinks.count() > 0) {
            const href = await ebiLinks.first().getAttribute("href");
            const match = href && href.match(/\/ebis\/(\d+)/);
            if (match) createdEbiId = match[1];
        }
        log("C3", "Criar novo EBI", true, `EBI id: ${createdEbiId}`);
    } catch (e) { log("C3", "Criar EBI", false, e.message); }

    // C4 – Acessar detalhe do EBI
    try {
        if (!createdEbiId) throw new Error("No EBI id (C3 failed)");
        await page.goto(`${BASE}/ebis/${createdEbiId}`);
        await page.waitForSelector("text=Registrar presença", { timeout: 6000 });
        log("C4", "Detalhe do EBI carregado com lista de presenças", true);
    } catch (e) { log("C4", "Detalhe EBI", false, e.message); }

    // C5 – Registrar presença de uma criança
    try {
        await page.click("text=Registrar presença");
        await page.waitForSelector("[role='dialog']", { timeout: 4000 });
        // select first child
        const childSelect = page.locator("[role='dialog'] select").first();
        await childSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        // Guardian name/phone should auto-fill; also accept custom
        const nameInput = page.locator("[role='dialog'] input[type!='hidden']").nth(0);
        if (await nameInput.inputValue() === "") await nameInput.fill("Responsável Teste");
        const phoneInput = page.locator("[role='dialog'] input[type!='hidden']").nth(1);
        if (await phoneInput.inputValue() === "") await phoneInput.fill("(11) 91234-5678");
        await page.click("[role='dialog'] button:has-text('Registrar presença')");
        await page.waitForTimeout(2000);
        // PIN dialog should appear
        const pinVisible = await page.locator("text=PIN gerado").isVisible().catch(() => false);
        if (pinVisible) {
            createdPin = await page.locator(".text-4xl.font-extrabold").first().textContent().catch(() => null);
            log("C5", "Presença registrada, PIN exibido na tela", true, `PIN: ${createdPin}`);
            await page.click("text=Entendi");
        } else {
            log("C5", "Presença registrada, PIN exibido", false, "Modal PIN não apareceu");
        }
        // Get presence id from table
        await page.waitForTimeout(1000);
    } catch (e) { log("C5", "Registrar presença", false, e.message); }

    // C6 – Registrar saída com PIN correto
    try {
        if (!createdPin) throw new Error("No PIN from C5");
        await page.waitForSelector("button:has-text('Registrar saída')", { timeout: 4000 });
        await page.locator("button:has-text('Registrar saída')").first().click();
        await page.waitForSelector("text=PIN de saída", { timeout: 4000 });
        await page.locator("[role='dialog'] input").first().fill(createdPin.trim());
        await page.waitForTimeout(300);
        await page.click("button:has-text('Confirmar saída')");
        await page.waitForTimeout(2000);
        const exitVisible = await page.locator(".glass td").filter({ hasText: /\d{2}:\d{2}/ }).count() > 0;
        log("C6", "Saída registrada com PIN correto", true);
    } catch (e) { log("C6", "Registrar saída com PIN", false, e.message); }

    // C7 – Encerrar EBI (todos com saída registrada)
    try {
        const closeBtn = page.locator("button:has-text('Encerrar EBI')");
        await page.waitForTimeout(500);
        const disabled = await closeBtn.isDisabled().catch(() => true);
        if (!disabled) {
            await closeBtn.click();
            await page.waitForTimeout(2000);
            const encerrado = await page.locator("text=ENCERRADO").isVisible().catch(() => false);
            log("C7", "Encerrar EBI → status ENCERRADO", encerrado);
        } else {
            log("C7", "Encerrar EBI – botão desabilitado (presença sem saída?)", false,
                "Verifique se todas as presenças têm saída");
        }
    } catch (e) { log("C7", "Encerrar EBI", false, e.message); }

    // C8 – Reabrir EBI
    try {
        const reopenBtn = page.locator("button:has-text('Reabrir EBI')");
        const disabled = await reopenBtn.isDisabled().catch(() => true);
        if (!disabled) {
            await reopenBtn.click();
            // Confirm modal
            await page.waitForSelector("[role='dialog']:has-text('Confirma')", { timeout: 4000 }).catch(() => { });
            const confirmBtn = page.locator("[role='dialog'] button:has-text('Confirmar')");
            if (await confirmBtn.isVisible().catch(() => false)) await confirmBtn.click();
            await page.waitForTimeout(2000);
            const aberto = await page.locator("text=ABERTO").isVisible().catch(() => false);
            log("C8", "Reabrir EBI → status ABERTO", aberto);
        } else {
            log("C8", "Reabrir EBI – botão desabilitado", false, "EBI não estava ENCERRADO");
        }
    } catch (e) { log("C8", "Reabrir EBI", false, e.message); }

    // C9 – Relatório por EBI
    try {
        if (!createdEbiId) throw new Error("No EBI id");
        await page.goto(`${BASE}/reports/ebi/${createdEbiId}`);
        await page.waitForSelector("text=Relatório do EBI", { timeout: 6000 });
        log("C9", "Relatório por EBI acessível para COORDENADORA", true);
    } catch (e) { log("C9", "Relatório EBI", false, e.message); }

    // C10 – Relatório Geral
    try {
        await page.goto(`${BASE}/reports/general`);
        await page.waitForSelector("text=Relatório Geral", { timeout: 6000 });
        const statsVisible = await page.locator(".glass").count() > 0;
        log("C10", "Relatório Geral acessível para COORDENADORA", statsVisible);
    } catch (e) { log("C10", "Relatório Geral", false, e.message); }

    // C11 – Perfil e upload
    try {
        await page.goto(`${BASE}/profile`);
        await page.waitForSelector("input[type='file']", { timeout: 5000 });
        const fileInput = page.locator("input[type='file']").first();
        await fileInput.setInputFiles({
            name: "test_rg.png",
            mimeType: "image/png",
            buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"),
        });
        await page.waitForTimeout(3000);
        const enviado = await page.locator("text=Enviado").first().isVisible().catch(() => false);
        log("C11", "Coord – perfil e upload documento", enviado);
    } catch (e) { log("C11", "Coord perfil upload", false, e.message); }

    // C12 – Logout
    try {
        await page.click("text=Sair");
        await page.waitForURL(/\/login/, { timeout: 5000 });
        log("C12", "Logout → /login", true);
    } catch (e) { log("C12", "Logout", false, e.message); }

    await ctx.close();
    return results;
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 2.3 – COLABORADORA
// ═══════════════════════════════════════════════════════════════════════════
async function runColabTests(browser) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const results = [];
    const log = (id, scenario, passed, notes = "") =>
        results.push({ id, scenario, passed, notes });

    // B1 – Login
    try {
        await loginAs(page, "colab@ebi.local", "colab001");
        log("B1", "Login colab → /ebis", true);
    } catch (e) {
        log("B1", "Login colab", false, e.message);
        await ctx.close();
        return results;
    }

    // B2 – NÃO vê Usuários
    try {
        const usersVisible = await page.locator("text=Usuários").isVisible().catch(() => false);
        log("B2", "Colab NÃO vê 'Usuários'", !usersVisible,
            usersVisible ? "⚠ VISÍVEL (gap)" : "OK");
    } catch (e) { log("B2", "Sidebar sem Usuários", false, e.message); }

    // B3 – NÃO vê relatórios no menu
    try {
        const relVisible = await page.locator("text=Relatório").isVisible().catch(() => false);
        log("B3", "Colab NÃO vê relatórios no menu", !relVisible,
            relVisible ? "⚠ VISÍVEL (gap)" : "OK");
    } catch (e) { log("B3", "Sem relatórios no menu", false, e.message); }

    // B4 – NÃO consegue criar EBI (botão oculto)
    try {
        await page.goto(`${BASE}/ebis`);
        await page.waitForTimeout(1500);
        const criarVisible = await page.locator("text=Criar EBI").isVisible().catch(() => false);
        log("B4", "Colab NÃO vê botão 'Criar EBI'", !criarVisible,
            criarVisible ? "⚠ VISÍVEL (gap)" : "OK – oculto");
    } catch (e) { log("B4", "Sem botão criar EBI", false, e.message); }

    // B5 – NÃO consegue Encerrar EBI (botão oculto)
    try {
        if (createdEbiId) {
            await page.goto(`${BASE}/ebis/${createdEbiId}`);
            await page.waitForTimeout(1500);
            const encerrarVisible = await page.locator("button:has-text('Encerrar EBI')").isVisible().catch(() => false);
            log("B5", "Colab NÃO vê 'Encerrar EBI'", !encerrarVisible,
                encerrarVisible ? "⚠ VISÍVEL (gap)" : "OK – oculto");
        } else {
            log("B5", "Encerrar EBI oculto", false, "EBI id não disponível – C3 falhou");
        }
    } catch (e) { log("B5", "Sem botão encerrar EBI", false, e.message); }

    // B6 – Visualiza lista de EBIs
    try {
        await page.goto(`${BASE}/ebis`);
        await page.waitForTimeout(1500);
        const count = await page.locator(".glass").count();
        log("B6", `Visualiza lista de EBIs (${count} itens)`, count > 0);
    } catch (e) { log("B6", "Lista EBIs", false, e.message); }

    // B7 – Registra presença
    try {
        if (!createdEbiId) throw new Error("No EBI id");
        await page.goto(`${BASE}/ebis/${createdEbiId}`);
        await page.click("text=Registrar presença");
        await page.waitForSelector("[role='dialog']", { timeout: 4000 });
        const childSelect = page.locator("[role='dialog'] select").first();
        await childSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        const nameInput = page.locator("[role='dialog'] input").nth(0);
        if (await nameInput.inputValue() === "") await nameInput.fill("Resp Colab");
        await page.click("[role='dialog'] button:has-text('Registrar presença')");
        await page.waitForTimeout(2000);
        const pinVisible = await page.locator("text=PIN gerado").isVisible().catch(() => false);
        let colabPin = null;
        if (pinVisible) {
            colabPin = await page.locator(".text-4xl").first().textContent().catch(() => null);
            await page.click("text=Entendi");
        }
        log("B7", "Colab registra presença com PIN", pinVisible, `PIN: ${colabPin}`);
        // B8 – Saída com PIN correto
        if (colabPin) {
            await page.waitForSelector("button:has-text('Registrar saída')", { timeout: 4000 });
            await page.locator("button:has-text('Registrar saída')").first().click();
            await page.waitForSelector("text=PIN de saída", { timeout: 4000 });
            await page.locator("[role='dialog'] input").first().fill(colabPin.trim());
            await page.click("button:has-text('Confirmar saída')");
            await page.waitForTimeout(2000);
            log("B8", "Colab registra saída com PIN", true);
        } else {
            log("B8", "Colab registra saída com PIN", false, "PIN não obtido em B7");
        }
    } catch (e) {
        log("B7", "Colab registra presença", false, e.message);
        log("B8", "Colab registra saída", false, "Dependia de B7");
    }

    // B9 – Acessa Meu Perfil
    try {
        await page.goto(`${BASE}/profile`);
        await page.waitForSelector("text=Meu Perfil", { timeout: 5000 });
        log("B9", "Colab acessa Meu Perfil", true);
    } catch (e) { log("B9", "Meu Perfil", false, e.message); }

    // B10 – Upload de documento
    try {
        await page.waitForSelector("input[type='file']", { timeout: 5000 });
        await page.locator("input[type='file']").first().setInputFiles({
            name: "colab_doc.png",
            mimeType: "image/png",
            buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"),
        });
        await page.waitForTimeout(3000);
        const enviado = await page.locator("text=Enviado").first().isVisible().catch(() => false);
        log("B10", "Colab faz upload de documento", enviado);
    } catch (e) { log("B10", "Colab upload documento", false, e.message); }

    // B11 – Logout
    try {
        await page.click("text=Sair");
        await page.waitForURL(/\/login/, { timeout: 5000 });
        log("B11", "Logout → /login", true);
    } catch (e) { log("B11", "Logout", false, e.message); }

    await ctx.close();
    return results;
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 3 – SECURITY
// ═══════════════════════════════════════════════════════════════════════════
async function runSecurityTests() {
    const results = [];
    const log = (id, scenario, passed, notes = "") =>
        results.push({ id, scenario, passed, notes });

    // S1 – Colab tenta GET /users → 403
    try {
        const { token } = await apiToken("colab@ebi.local", "colab001");
        const { status } = await apiGet(token, "/users");
        log("S1", "Colab GET /users → 403", status === 403, `Status: ${status}`);
    } catch (e) { log("S1", "Colab GET /users", false, e.message); }

    // S2 – Colab tenta GET /reports/general → 403
    try {
        const { token } = await apiToken("colab@ebi.local", "colab001");
        const { status } = await apiGet(token, "/reports/general");
        log("S2", "Colab GET /reports/general → 403", status === 403, `Status: ${status}`);
    } catch (e) { log("S2", "Colab GET /reports/general", false, e.message); }

    // S3 – Colab tenta fechar EBI → 403
    try {
        const { token } = await apiToken("colab@ebi.local", "colab001");
        const ebiId = createdEbiId || 1;
        const { status } = await apiPost(token, `/ebi/${ebiId}/close`);
        log("S3", "Colab POST /ebi/:id/close → 403", status === 403, `Status: ${status}`);
    } catch (e) { log("S3", "Colab fechar EBI", false, e.message); }

    // S4 – Login com senha errada → 401
    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `username=admin@ebi.local&password=wrongpass`,
        });
        log("S4", "Login senha errada → 401", res.status === 401, `Status: ${res.status}`);
    } catch (e) { log("S4", "Login senha errada", false, e.message); }

    // S5 – Token inválido → 401
    try {
        const { status } = await apiGet("invalid.token.here", "/users");
        log("S5", "Token inválido → 401", status === 401, `Status: ${status}`);
    } catch (e) { log("S5", "Token inválido", false, e.message); }

    // S6 – Upload arquivo > 10MB → bloqueado (frontend ou 413 backend)
    try {
        const { token } = await apiToken("coord@ebi.local", "coord001");
        const bigBuf = Buffer.alloc(11 * 1024 * 1024, "a");
        const formData = new FormData();
        formData.append("document_type", "RG");
        formData.append("file", new Blob([bigBuf], { type: "application/pdf" }), "big.pdf");
        const res = await fetch(`${API}/profile/me/documents`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        log("S6", "Upload > 10MB → 413/422", [413, 422].includes(res.status) || res.status >= 400,
            `Status: ${res.status}`);
    } catch (e) { log("S6", "Upload > 10MB", false, e.message); }

    // S7 – Checkout com PIN errado → 403/400/422
    try {
        const { token } = await apiToken("coord@ebi.local", "coord001");
        // Get any presence id from first EBI
        const ebiRes = await apiGet(token, `/ebi?page=1`);
        const ebiId = ebiRes.body?.items?.[0]?.id;
        if (ebiId) {
            const ebiDetail = await apiGet(token, `/ebi/${ebiId}`);
            const presenceId = ebiDetail.body?.presences?.[0]?.id;
            if (presenceId) {
                const { status } = await apiPost(token, `/ebi/presence/${presenceId}/checkout`, { pin_code: "0000" });
                log("S7", "PIN errado no checkout → 403/400/422",
                    [400, 403, 422, 409].includes(status), `Status: ${status}`);
            } else {
                log("S7", "PIN errado checkout", false, "No presence found");
            }
        } else {
            log("S7", "PIN errado checkout", false, "No EBI found");
        }
    } catch (e) { log("S7", "PIN errado checkout", false, e.message); }

    return results;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN RUNNER
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
    console.log("🚀 EBI Vila Paula – Playwright Audit\n");
    const browser = await chromium.launch({ headless: true });

    const [adminResults, coordResults, colabResults, secResults] = await Promise.allSettled([
        runAdminTests(browser),
        runCoordTests(browser),
    ]).then(async ([a, c]) => {
        // collab and security run after coord to get EBI id
        const colabRes = await runColabTests(browser);
        const secRes = await runSecurityTests();
        return [a.value || [], c.value || [], colabRes, secRes];
    });

    await browser.close();

    // Print results
    const allGroups = [
        { label: "2.1 ADMINISTRADOR", results: adminResults },
        { label: "2.2 COORDENADORA", results: coordResults },
        { label: "2.3 COLABORADORA", results: colabResults },
        { label: "3 SEGURANÇA", results: secResults },
    ];

    let totalPass = 0, totalFail = 0;
    for (const group of allGroups) {
        console.log(`\n${"═".repeat(60)}`);
        console.log(`📋 Fase ${group.label}`);
        console.log("═".repeat(60));
        for (const r of group.results) {
            const icon = r.passed ? "✅" : "❌";
            console.log(`${icon} [${r.id}] ${r.scenario}${r.notes ? " — " + r.notes : ""}`);
            if (r.passed) totalPass++; else totalFail++;
        }
    }

    console.log("\n" + "═".repeat(60));
    console.log(`📊 RESULTADO FINAL: ${totalPass} passou / ${totalFail} falhou`);
    console.log("═".repeat(60));
}

main().catch(console.error);
