export async function protege() {

    const configs = await fetch("./js/_config.json").then(r => r.json());

    const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";

    const API_URL = isLocalhost ? configs.DEV_API_URL : configs.PROD_API_URL;

    const data = await enviar(`${API_URL}/auth/check`, '{}');

    if (!data.authenticated) {
        window.location.href = "/entrar";
    }

}

window.protege = protege; 
