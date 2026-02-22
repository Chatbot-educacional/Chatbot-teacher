export function safeJsonParse(text: string) {
    try {

        // pega apenas o JSON da resposta
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("JSON não encontrado na resposta da IA");
        }

        let clean = jsonMatch[0];

        // remove trailing commas
        clean = clean.replace(/,\s*}/g, "}");
        clean = clean.replace(/,\s*]/g, "]");

        return JSON.parse(clean);

    } catch (error) {
        console.error("Erro no JSON da IA:", text);
        throw error;
    }
}