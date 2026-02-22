export async function generateWithOllama({
    prompt,
    stream = false
}: {
    prompt: string;
    stream?: boolean;
}) {

    const response = await fetch("/ollama/api/generate", {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify({
            model: "llama3:8b",
            prompt,
            stream
        }),

    });

    const data = await response.json();

    return data.response;
}