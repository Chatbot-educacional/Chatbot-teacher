// src/lib/pocketbase.ts
import PocketBase, { RecordModel as PBRecord } from 'pocketbase';

// URL do PocketBase - usar variável de ambiente ou fallback para desenvolvimento
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(POCKETBASE_URL);

// --- Tipos de dados ---

/**
 * Modelo de usuário conforme definido na collection "users" do PocketBase.
 * Estende o Record padrão do SDK, que já inclui id, created, updated, etc.
 */
export interface UserRecord extends PBRecord {
  email: string;
  name: string;          // Nome completo
  emailVisibility: boolean;
  role: string;
  bio?: string;
  avatar?: string;
}

/**
 * Resposta de autenticação via PocketBase.
 * authWithPassword retorna token + record.
 */
export interface AuthResponse {
  token: string;
  record: UserRecord;
}

/**
 * Retorna o usuário logado, ou undefined se não houver sessão.
 */
export const getCurrentUser = (): UserRecord | undefined => {
  const model = pb.authStore.model;
  if (!model) return undefined;
  
  // Cast do modelo do PocketBase para nosso tipo UserRecord
  const user = model as unknown as UserRecord;
  
  return user;
};

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  return pb.authStore.isValid;
};

/**
 * Faz logout do usuário
 */
export const logout = (): void => {
  pb.authStore.clear();
};

/**
 * Login com email e senha
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const authData = await pb.collection('users').authWithPassword(email, password);
  return {
    token: authData.token,
    record: authData.record as UserRecord
  };
};

/**
 * Registro de novo usuário
 */
export const register = async (data: {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  role: string;
}): Promise<UserRecord> => {
  // Derivar username obrigatório no PocketBase
  const baseUser = (data.name?.trim() || data.email.split('@')[0] || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_\-]+/g, '_')
    .slice(0, 24);
  const username = baseUser || `user_${Math.random().toString(36).slice(2, 8)}`;

  const record = await pb.collection('users').create({
    username,
    email: data.email,
    emailVisibility: true,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
    name: data.name,
    role: data.role,
  });

  return record as UserRecord;
};

// Listener para mudanças no estado de autenticação
export const onAuthChange = (callback: (token: string, model: UserRecord | null) => void) => {
  return pb.authStore.onChange((token, model) => {
    callback(token, model as UserRecord | null);
  });
};
