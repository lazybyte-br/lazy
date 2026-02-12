export async function enviar( url, dados ) {
    
    const API_URL = url;

    const res = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // importante para enviar cookies!
        body: JSON.stringify( dados ),
    });

    return await res.json();
    
}

window.enviar = enviar; // Tornar a função enviar globalmente acessível 
