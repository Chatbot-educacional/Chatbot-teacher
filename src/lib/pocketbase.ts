// src/lib/pocketbase.ts
import PocketBase, { RecordModel as PBRecord } from 'pocketbase';

const resolvePocketBaseUrl = () => {
  const envValue = import.meta.env.VITE_POCKETBASE_URL;

  if (envValue) {
    if (/^https?:\/\//i.test(envValue)) {
      return envValue;
    }

    if (typeof window !== "undefined") {
      const prefix = envValue.startsWith("/") ? "" : "/";
      return `${window.location.origin}${prefix}${envValue}`;
    }
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/pb`;
  }

  return "http://127.0.0.1:8090";
};

const POCKETBASE_URL = resolvePocketBaseUrl();

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

// --- Tipos de dados para Classes ---

export interface ClassRecord extends PBRecord {
  title?: string;
  name: string;
  description?: string;
  createdBy?: string;
  code?: string;
}

export interface ClassMemberRecord extends PBRecord {
  class: string;
  user: string;
  role: string;
}

// --- Gerenciamento de Turmas/Classes ---

/**
 * Cria uma nova turma
 */
export const createClass = async (title: string, description?: string): Promise<ClassRecord> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const record = await pb.collection('classes').create({
    name: title,
    description: description || '',
    createdBy: user.id,
  });

  // Adiciona o professor como membro da turma
  try {
    await pb.collection('class_members').create({
      class: record.id,
      user: user.id,
      role: 'teacher',
    });
  } catch (error) {
    console.error('Erro ao adicionar professor como membro:', error);
  }

  return record as ClassRecord;
};

/**
 * Lista as turmas do professor logado
 */
export const listTeachingClasses = async (): Promise<ClassRecord[]> => {
  const user = getCurrentUser();
  if (!user) {
    return [];
  }

  try {
    const records = await pb.collection('classes').getFullList({
      filter: `createdBy = "${user.id}"`,
      sort: '-created',
      requestKey: `list_classes_${user.id}_${Date.now()}`,
    } as any);
    return records as ClassRecord[];
  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    return [];
  }
};

/**
 * Lista todas as turmas que o usuário participa (como aluno ou professor)
 */
export const listMyClasses = async (): Promise<ClassRecord[]> => {
  const user = getCurrentUser();
  if (!user) {
    return [];
  }

  try {
    const memberships = await pb.collection('class_members').getFullList({
      filter: `user = "${user.id}"`,
      expand: 'class',
    });

    return memberships.map((m: any) => m.expand?.class).filter(Boolean) as ClassRecord[];
  } catch (error) {
    console.error('Erro ao listar minhas turmas:', error);
    return [];
  }
};

/**
 * Obtém detalhes de uma turma específica
 */
export const getClassDetails = async (classId: string): Promise<ClassRecord | null> => {
  try {
    const record = await pb.collection('classes').getOne(classId);
    return record as ClassRecord;
  } catch (error) {
    console.error('Erro ao obter detalhes da turma:', error);
    return null;
  }
};

/**
 * Atualiza uma turma
 */
export const updateClass = async (classId: string, data: { title?: string; description?: string }): Promise<ClassRecord> => {
  const updateData: any = {};
  
  if (data.title) {
    updateData.name = data.title;
  }
  
  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  const record = await pb.collection('classes').update(classId, updateData);
  return record as ClassRecord;
};

/**
 * Deleta uma turma
 */
export const deleteClass = async (classId: string): Promise<boolean> => {
  try {
    await pb.collection('classes').delete(classId);
    return true;
  } catch (error) {
    console.error('Erro ao deletar turma:', error);
    return false;
  }
};

/**
 * Lista os membros de uma turma
 */
export const listClassMembers = async (classId: string): Promise<any[]> => {
  try {
    // Buscar membros com requestKey único para evitar auto-cancel
    const members = await pb.collection('class_members').getFullList({
      filter: `class = "${classId}"`,
      expand: 'user',
      requestKey: `members_${classId}_${Date.now()}`,
    } as any);
    
    // Se o expand não funcionou, buscar usuários manualmente
    const membersWithUsers = await Promise.all(
      members.map(async (member: any) => {
        if (!member.expand?.user && member.user) {
          try {
            const user = await pb.collection('users').getOne(member.user, {
              requestKey: `user_${member.user}_${Date.now()}`,
            } as any);
            return {
              ...member,
              expand: {
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                }
              }
            };
          } catch (err) {
            console.warn('Não foi possível buscar dados do usuário:', err);
            return member;
          }
        }
        return member;
      })
    );
    
    return membersWithUsers;
  } catch (error) {
    console.error('Erro ao listar membros da turma:', error);
    return [];
  }
};

/**
 * Adiciona um membro à turma
 */
export const addClassMember = async (classId: string, userId: string, role: string = 'student'): Promise<boolean> => {
  try {
    await pb.collection('class_members').create({
      class: classId,
      user: userId,
      role,
    });
    return true;
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    return false;
  }
};

/**
 * Remove um membro da turma
 */
export const removeClassMember = async (memberId: string): Promise<boolean> => {
  try {
    await pb.collection('class_members').delete(memberId);
    return true;
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    return false;
  }
};

/**
 * Busca usuários por email ou nome
 */
export const searchUsers = async (query: string): Promise<UserRecord[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    const records = await pb.collection('users').getList(1, 10, {
      filter: `email ~ "${query}" || name ~ "${query}"`,
      requestKey: `search_users_${Date.now()}`,
    } as any);

    return records.items as UserRecord[];
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
};
