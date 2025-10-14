import PocketBase from "pocketbase";
import dotenv from "dotenv";

dotenv.config();

const pb = new PocketBase(process.env.POCKETBASE_URL || "http://127.0.0.1:8090");

export async function connectPocketBase(): Promise<void> {
  try {
    await pb.collection("_superusers").authWithPassword(
      process.env.POCKETBASE_EMAIL as string,
      process.env.POCKETBASE_PASSWORD as string
    );
    console.log("Autenticação superuser feita com sucesso");
  } catch (err) {
    console.error("Erro na autenticação do superuser:", err);
  }
}

export default pb;
