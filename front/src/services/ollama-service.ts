export async function generateWithOllama(prompt: string) {
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama3:8b", // CONFIRA SE ESSE É O NOME CERTO
            prompt,
            stream: false,
            options: {
                num_predict: 2000
            }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro Ollama:", errorText);
        throw new Error("Falha ao conectar com Ollama");
    }

    const data = await response.json();

    console.log("RESPOSTA COMPLETA OLLAMA:", data);

    return data.response; // 🔥 ESSA LINHA É O QUE IMPORTA
}