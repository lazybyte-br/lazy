function router() {
    const path = window.location.pathname;

    // Rota amigável: /lab  →  tutoriais.html
    if (path === "/lab" || path === "/lab/") {
        window.location.href = "/tutoriais.html";
        return;
    }

    // Outras rotas que você quiser adicionar:
    if (path === "/produtos") {
        window.location.href = "produtos.html";
        return;
    }

    // Rotas padrão (opcional):
    // Se quiser mandar qualquer rota inválida para index:
    // window.location.href = "index.html";
}

export { router };

window.router = router;


