# 🤖 Chatbot Educacional – Teacher

O **Chatbot Teacher** é um projeto do [Chatbot Educacional](https://github.com/Chatbot-educacional) desenvolvido para auxiliar professores e gestores a interagir com o sistema de forma intuitiva e automatizada.  
A aplicação permite **enviar mensagens, gerenciar alunos, acessar relatórios e utilizar o chatbot** para consultas e automações no ambiente educacional.

---

## 🧩 Tecnologias Utilizadas

### **Frontend**
- ⚛️ **React** — criação da interface e componentes interativos  
- 🧱 **TypeScript** — tipagem estática e maior segurança no código  
- ⚡ **Vite** — build rápido e ambiente de desenvolvimento ágil  
- 🎨 **TailwindCSS** — estilização moderna e responsiva  
- 🧩 **Shadcn/UI** — componentes de interface reutilizáveis e estilizados  
- 🔤 **Lucide-React** — ícones leves e vetoriais para interface  
- 📬 **Axios / Fetch API** — integração com o backend

### **Backend**
- 🧰 **Node.js** + **Express** — API responsável por tratar requisições e respostas  
- ✉️ **SendGrid API** — envio de e-mails diretamente da aplicação  
- 🔐 **dotenv** — gerenciamento de variáveis de ambiente  
- 🧩 **Provider Service** — integração externa de IA (ex: Gemini ou OpenAI API)

### **Infraestrutura / Outros**
- 🧭 **GitHub Actions** — versionamento e colaboração em equipe  
- 🧪 **Vercel ou Netlify (opcional)** — para deploy do frontend  
- 🧱 **Lovable / Render / Railway (opcional)** — deploy do backend

---

## 🚀 Funcionalidades Principais

| Área | Funcionalidade | Descrição |
|------|----------------|-----------|
| 💬 **Chatbot** | Interação com IA | O professor pode conversar com o chatbot para tirar dúvidas, obter relatórios ou ajuda sobre alunos. |
| 📧 **Envio de E-mails** | Envio direto pelo painel | Permite escrever título, destinatário e conteúdo e enviar via SendGrid. |
| 👥 **Gerenciamento de Alunos** | Listar, filtrar e buscar alunos | O sistema permite visualizar informações e status dos alunos. |
| 🧑‍🏫 **Painel do Professor** | Interface intuitiva | Exibe cards com ações rápidas (ex: enviar mensagem, acessar IA, visualizar relatórios). |
| 🧩 **Integração com Providers** | Configuração de APIs externas | Permite configurar provedores de IA (como Gemini) através de chave no `config.json`. |

---

## 📂 Estrutura do Projeto

```
Chatbot-teacher/
├── public/               # Assets estáticos (ícones, imagens, etc.)
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/            # Páginas principais (Dashboard, Chat, etc.)
│   ├── services/         # Comunicação com APIs e providers
│   ├── hooks/            # Hooks customizados
│   ├── styles/           # Estilos globais e Tailwind config
│   ├── utils/            # Funções auxiliares
│   └── main.tsx          # Arquivo principal da aplicação React
├── backend/
│   ├── routes/           # Rotas Express
│   ├── controllers/      # Lógica das rotas
│   ├── services/         # Integração com SendGrid e Providers
│   ├── config.json       # Configuração de API keys (não versionar!)
│   └── server.js         # Inicialização do servidor backend
├── package.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ Como Executar o Projeto Localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/Chatbot-educacional/Chatbot-teacher.git
cd Chatbot-teacher
```

---

### 2. Instalar dependências

#### Frontend:
```bash
cd frontend
npm install
```

#### Backend:
```bash
cd backend
npm install
```

---

### 3. Configurar variáveis de ambiente

No backend, crie um arquivo `.env` na pasta `backend/` com o seguinte formato:

```
SENDGRID_API_KEY=your_sendgrid_api_key
PROVIDER_API_KEY=your_provider_key (ex: Gemini)
PORT=5000
```

Se estiver usando o arquivo `config.json`, adicione:
```json
{
  "provider": "gemini",
  "apiKey": "sua_chave_aqui"
}
```

---

### 4. Rodar o projeto

#### Iniciar o backend:
```bash
cd backend
npm run dev
```

#### Iniciar o frontend:
```bash
cd frontend
npm run dev
```

O frontend ficará disponível em:
👉 [http://localhost:5173](http://localhost:5173)

E o backend em:
👉 [http://localhost:5000](http://localhost:5000)

---

## 🧠 Fluxo de Funcionamento

1. O **usuário acessa o painel** do professor e escolhe uma ação (ex: enviar mensagem, conversar com IA, etc).  
2. O frontend **envia uma requisição** ao backend via API.  
3. O backend processa os dados, usando **SendGrid** (para e-mails) ou o **Provider** configurado (para IA).  
4. O resultado é exibido na interface (resposta do chatbot, status do envio, etc).

---

## 🧑‍💻 Como Contribuir

1. Faça um fork do projeto  
2. Crie uma nova branch para sua feature:
   ```bash
   git checkout -b feature/nome-da-feature
   ```
3. Faça suas alterações e commit:
   ```bash
   git commit -m "Adiciona nova funcionalidade"
   ```
4. Envie para seu fork e abra um Pull Request:
   ```bash
   git push origin feature/nome-da-feature
   ```

---

## 🧾 Licença

Este projeto está sob a licença **MIT**.  
Sinta-se livre para usar, modificar e contribuir com o Chatbot Educacional. 💙

---

## 👥 Equipe

**Chatbot Educacional Team**  
Desenvolvido com foco em educação, colaboração e aprendizado contínuo.  
Repositório principal: [Chatbot Educacional](https://github.com/Chatbot-educacional)

---
