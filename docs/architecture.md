# Arquitetura do Módulo Professor

## 1. Visão Geral

O módulo do professor é responsável pelo acompanhamento de turmas, visualização de métricas de interação dos alunos e geração de planos de aula com apoio de modelos de linguagem (LLMs). O sistema não possui backend próprio, utilizando o PocketBase como serviço de persistência.

---

## 2. Estilo Arquitetural

A arquitetura adotada é do tipo:

**Client-Server com Backend-as-a-Service (BaaS) e cliente rico (Rich Client)**.

O frontend concentra a lógica de aplicação, enquanto o PocketBase é utilizado exclusivamente para armazenamento e recuperação de dados.

---

## 3. Estrutura Arquitetural

```
Frontend (React)
   ├── Camada de Apresentação (UI)
   ├── Camada de Aplicação (lógica e métricas)
   ├── Serviços (PocketBase e LLM)
   ↓
PocketBase (persistência de dados)
LLM (geração de plano de aula)
```

---

## 4. Camadas do Sistema

### 4.1 Apresentação

Responsável pela interface com o usuário, incluindo dashboards, visualização de turmas e interação para geração de planos de aula.

### 4.2 Aplicação

Responsável pelo processamento dos dados no cliente, incluindo:

* cálculo de métricas de interação
* agregação de dados
* preparação de dados para visualização
* construção de prompts para LLM

### 4.3 Dados (BaaS)

O PocketBase é utilizado como camada de persistência, armazenando informações sobre usuários, turmas, atividades e interações.

### 4.4 Serviços Externos

A LLM é utilizada exclusivamente para geração de planos de aula, não participando do processamento de métricas.

---

## 5. Fluxos Principais

### 5.1 Métricas

1. O frontend consulta os dados no PocketBase
2. Os dados são processados localmente
3. As métricas são calculadas no cliente
4. Os resultados são exibidos na interface

### 5.2 Geração de Plano de Aula

1. O professor fornece parâmetros (tema, nível, objetivos)
2. O frontend envia um prompt para a LLM
3. A LLM retorna o plano de aula
4. O resultado é apresentado ao usuário

---

## 6. Justificativa

A adoção de uma arquitetura Client-Server com BaaS reduz a complexidade do sistema ao eliminar a necessidade de um backend dedicado. A concentração da lógica no cliente permite maior flexibilidade para experimentação, especialmente no uso de diferentes modelos de linguagem. A separação entre processamento de métricas e uso de LLM garante baixo acoplamento e clareza de responsabilidades.

---

