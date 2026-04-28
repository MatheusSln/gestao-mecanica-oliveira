import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true }); // Mobile view

    let errors = [];
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', error => {
      console.log('ERRO NA PAGINA:', error.message);
      errors.push(error.message);
    });

    console.log("Navegando para o Dashboard (localhost:5173)...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'print_dashboard.png' });
    console.log("Print do Dashboard salvo como 'print_dashboard.png'");

    // Check title
    const content = await page.content();
    if (content.includes("Mecânica Oliveira")) {
      console.log("SUCESSO: App renderizado, cabeçalho encontrado.");
    } else {
      console.log("ERRO: App não renderizou o cabeçalho 'Mecânica Oliveira'.");
      errors.push("Falha de Renderização do Cabeçalho");
    }

    console.log("Navegando para Nova OS...");
    await page.goto('http://localhost:5173/recibos/nova', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'print_nova_os.png' });
    console.log("Print de Nova OS salvo como 'print_nova_os.png'");

    console.log("Navegando para Estoque...");
    await page.goto('http://localhost:5173/estoque', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'print_estoque.png' });
    console.log("Print de Estoque salvo como 'print_estoque.png'");

    console.log("Navegando para Equipe...");
    await page.goto('http://localhost:5173/equipe', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'print_equipe.png' });
    console.log("Print de Equipe salvo como 'print_equipe.png'");

    console.log("Navegando para Detalhes OS 1001...");
    await page.goto('http://localhost:5173/recibos/1001', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'print_detalhes_os.png', fullPage: true });
    console.log("Print de Detalhes OS salvo como 'print_detalhes_os.png'");

    await browser.close();

    if (errors.length > 0) {
      console.log("RELATORIO DE ERROS:");
      errors.forEach(e => console.log("-", e));
    } else {
      console.log("Todos os testes passaram sem erros visíveis na página.");
    }
  } catch (err) {
    console.error("ERRO FATAL NA EXECUÇÃO DO TESTE:", err);
  }
})();