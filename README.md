# 🏫 PMJ - Educacional - Gestão Escolar Inteligente

![Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

O **PMJ - Educacional** é um sistema completo para administração escolar, desenvolvido para otimizar o fluxo de dados em instituições de ensino. Reúne gestão de alunos, professores, turmas e emissão consolidada de relatórios oficiais.

---

## 🚀 Funcionalidades Principais

*   📊 **Dashboard Dinâmico:** Visão geral de estatísticas (alunos, turmas, eventos e últimas matrículas).
*   👥 **Cadastros Administrativos:** Módulo completo de Matrículas (Alunos) e RH (Funcionários).
*   📝 **Lançamento de Notas/Faltas:** Fluxo individualizado ou em massa (por turma), com persistência segura.
*   📅 **Calendário Acadêmico:** Organização de feriados, reuniões, avaliações e atividades dinâmicas.
*   📄 **Central de Relatórios (PDF):**
    *   Ficha Cadastral do Aluno
    *   Boletim Bimestral
    *   Lista de Alunos por Turma
    *   Total de Alunos (Censo) e Declarações de Vínculo.

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Motion](https://motion.dev/)
*   **Banco de Dados & API:** [Supabase](https://supabase.com/)
*   **Documentos / Impressão:** `jsPDF` + `jsPDF-AutoTable`

---

## ⚙️ Instalação e Execução Local

### Pré-requisitos
Certifique-se de ter o **Node.js** (versão 18 ou superior) instalado na sua máquina.

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd pmj---educacional
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto contendo as suas chaves do Supabase:
```env
VITE_SUPABASE_URL=https://sua-url-do-supabase.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

### 4. Iniciar o Servidor
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:5173` ou `3000`.

---

## 🔒 Variáveis Seguras
O arquivo `.env` está configurado no `.gitignore` para que suas senhas e credenciais **não subam** para o GitHub publicamente. Nunca comite dados privados de acesso!

---
💡 *Desenvolvido para automatização e rastreabilidade escolar.*
